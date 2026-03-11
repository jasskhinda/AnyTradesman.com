import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Create admin Supabase client lazily to avoid build-time errors
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables for webhook');
  }
  return createClient(url, key);
}

// Helper to find subscription by Stripe customer ID
async function findSubscriptionByCustomer<T extends string>(
  customerId: string,
  selectFields: T
) {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select(selectFields)
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error(`[webhook] DB error finding subscription for customer ${customerId}:`, error.message);
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.info(`[webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;
        const tierId = session.metadata?.tier_id;

        if (!businessId) {
          console.warn(`[webhook] checkout.session.completed missing business_id metadata (event ${event.id})`);
          break;
        }

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          if (!subscriptionId) {
            console.error(`[webhook] checkout.session.completed has no subscription ID (event ${event.id})`);
            break;
          }

          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data'],
          });

          const firstItem = subscriptionData.items?.data?.[0];
          const periodStart = firstItem?.current_period_start;
          const periodEnd = firstItem?.current_period_end;

          const { error: upsertError } = await getSupabaseAdmin()
            .from('subscriptions')
            .upsert({
              business_id: businessId,
              tier: mapTierToSubscriptionTier(tierId),
              plan_id: tierId || null,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            }, {
              onConflict: 'business_id',
            });

          if (upsertError) {
            console.error(`[webhook] Failed to upsert subscription for business ${businessId}:`, upsertError.message);
            throw new Error('Database error: subscription upsert failed');
          }

          // Auto-verify business when subscription activates
          const { error: verifyError } = await getSupabaseAdmin()
            .from('businesses')
            .update({
              is_verified: true,
              verification_status: 'verified',
            })
            .eq('id', businessId);

          if (verifyError) {
            console.error(`[webhook] Failed to verify business ${businessId}:`, verifyError.message);
          }

          console.info(`[webhook] Subscription created for business ${businessId}, tier: ${tierId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSub = await findSubscriptionByCustomer(customerId, 'business_id, tier');
        if (!existingSub) {
          console.warn(`[webhook] No subscription found for customer ${customerId} during subscription.updated`);
          break;
        }

        const firstItem = subscription.items?.data?.[0];
        const periodStart = firstItem?.current_period_start;
        const periodEnd = firstItem?.current_period_end;

        const newTierId = subscription.metadata?.tier_id;
        const newDbTier = newTierId ? mapTierToSubscriptionTier(newTierId) : null;

        const updateData: Record<string, unknown> = {
          status: mapStripeStatus(subscription.status),
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        };

        if (newTierId) {
          updateData.plan_id = newTierId;
        }
        if (newDbTier && newDbTier !== existingSub.tier) {
          updateData.tier = newDbTier;
        }

        const { error: updateError } = await getSupabaseAdmin()
          .from('subscriptions')
          .update(updateData)
          .eq('business_id', existingSub.business_id);

        if (updateError) {
          console.error(`[webhook] Failed to update subscription for business ${existingSub.business_id}:`, updateError.message);
          throw new Error('Database error: subscription update failed');
        }

        console.info(`[webhook] Subscription updated for business ${existingSub.business_id}, status: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSub = await findSubscriptionByCustomer(customerId, 'business_id');
        if (!existingSub) {
          console.warn(`[webhook] No subscription found for customer ${customerId} during subscription.deleted`);
          break;
        }

        const { error: cancelError } = await getSupabaseAdmin()
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('business_id', existingSub.business_id);

        if (cancelError) {
          console.error(`[webhook] Failed to cancel subscription for business ${existingSub.business_id}:`, cancelError.message);
          throw new Error('Database error: subscription cancel failed');
        }

        // Remove verified badge if no verified credentials exist
        const { data: verifiedCreds, error: credsError } = await getSupabaseAdmin()
          .from('business_credentials')
          .select('id')
          .eq('business_id', existingSub.business_id)
          .eq('verification_status', 'verified')
          .limit(1);

        if (credsError) {
          console.error(`[webhook] Failed to check credentials for business ${existingSub.business_id}:`, credsError.message);
        } else if (!verifiedCreds || verifiedCreds.length === 0) {
          await getSupabaseAdmin()
            .from('businesses')
            .update({ is_verified: false })
            .eq('id', existingSub.business_id);
        }

        console.info(`[webhook] Subscription canceled for business ${existingSub.business_id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const existingSub = await findSubscriptionByCustomer(customerId, 'business_id');
        if (!existingSub) {
          console.warn(`[webhook] No subscription found for customer ${customerId} during invoice.payment_failed`);
          break;
        }

        const { error: pastDueError } = await getSupabaseAdmin()
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('business_id', existingSub.business_id);

        if (pastDueError) {
          console.error(`[webhook] Failed to mark past_due for business ${existingSub.business_id}:`, pastDueError.message);
        }

        console.info(`[webhook] Payment failed for business ${existingSub.business_id}, marked past_due`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[webhook] Error processing ${event.type} (${event.id}):`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

function mapTierToSubscriptionTier(tierId: string | undefined): string {
  switch (tierId) {
    case 'beta':
      return 'basic';
    case 'monthly':
    case 'sixMonth':
      return 'professional';
    case 'yearly':
      return 'enterprise';
    default:
      console.error(`Unknown tier ID in webhook: ${tierId}`);
      return 'professional'; // Safe default rather than silent downgrade
  }
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return status;
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'active';
  }
}
