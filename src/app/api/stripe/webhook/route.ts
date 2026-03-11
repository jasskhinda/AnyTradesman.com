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
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
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
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;
        const tierId = session.metadata?.tier_id;

        if (!businessId) break;

        if (session.mode === 'subscription') {
          // Create or update subscription
          const subscriptionId = session.subscription as string;
          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data'],
          });

          // Get period dates from the first subscription item
          const firstItem = subscriptionData.items?.data?.[0];
          const periodStart = firstItem?.current_period_start;
          const periodEnd = firstItem?.current_period_end;

          await getSupabaseAdmin()
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

          // Auto-verify business when subscription activates
          await getSupabaseAdmin()
            .from('businesses')
            .update({
              is_verified: true,
              verification_status: 'verified',
            })
            .eq('id', businessId);
        } else {
          // One-time payment (pay per lead) - handle differently
          // Could create credits or tokens for lead purchases
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find business by stripe customer ID
        const { data: existingSub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('business_id, tier')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          // Get period dates from the first subscription item
          const firstItem = subscription.items?.data?.[0];
          const periodStart = firstItem?.current_period_start;
          const periodEnd = firstItem?.current_period_end;

          // Check if tier changed (set by update-subscription API via metadata)
          const newTierId = subscription.metadata?.tier_id;
          const newDbTier = newTierId ? mapTierToSubscriptionTier(newTierId) : null;

          const updateData: Record<string, unknown> = {
            status: mapStripeStatus(subscription.status),
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          };

          // Update tier and plan_id if changed
          if (newTierId) {
            updateData.plan_id = newTierId;
          }
          if (newDbTier && newDbTier !== existingSub.tier) {
            updateData.tier = newDbTier;
          }

          await getSupabaseAdmin()
            .from('subscriptions')
            .update(updateData)
            .eq('business_id', existingSub.business_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find and update subscription status
        const { data: existingSub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          await getSupabaseAdmin()
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('business_id', existingSub.business_id);

          // Remove verified badge if no verified credentials exist
          const { data: verifiedCreds } = await getSupabaseAdmin()
            .from('business_credentials')
            .select('id')
            .eq('business_id', existingSub.business_id)
            .eq('verification_status', 'verified')
            .limit(1);

          if (!verifiedCreds || verifiedCreds.length === 0) {
            await getSupabaseAdmin()
              .from('businesses')
              .update({ is_verified: false })
              .eq('id', existingSub.business_id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Update subscription status to past_due
        const { data: existingSub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          await getSupabaseAdmin()
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('business_id', existingSub.business_id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
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
