import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Create admin Supabase client for webhook handling
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
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

          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              business_id: businessId,
              tier: mapTierToSubscriptionTier(tierId),
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            }, {
              onConflict: 'business_id',
            });
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
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          // Get period dates from the first subscription item
          const firstItem = subscription.items?.data?.[0];
          const periodStart = firstItem?.current_period_start;
          const periodEnd = firstItem?.current_period_end;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: mapStripeStatus(subscription.status),
              current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq('business_id', existingSub.business_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find and update subscription status
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('business_id', existingSub.business_id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Update subscription status to past_due
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          await supabaseAdmin
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
      return 'free';
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
