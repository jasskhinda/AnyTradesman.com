import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { SubscriptionView } from './subscription-view';

// Detect plan_id from Stripe subscription interval/amount
function detectPlanIdFromStripeItem(item: { price?: { recurring?: { interval: string; interval_count: number } | null; unit_amount?: number | null } | null }): string | null {
  if (!item?.price?.recurring) return null;
  const { interval, interval_count: intervalCount } = item.price.recurring;
  const unitAmount = item.price.unit_amount || 0;

  if (interval === 'year') return 'yearly';
  if (interval === 'month' && intervalCount === 6) return 'sixMonth';
  if (interval === 'month') {
    // Distinguish beta ($9.99 = 999 cents) from monthly ($49.99 = 4999 cents)
    return unitAmount <= 1500 ? 'beta' : 'monthly';
  }
  return null;
}

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) {
    redirect('/business/setup');
  }

  // Fetch subscription (include stripe fields for portal and backfill)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, tier, plan_id, status, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('business_id', business.id)
    .maybeSingle();

  // Backfill plan_id from Stripe if missing (one-time migration for legacy subscriptions)
  let resolvedPlanId = subscription?.plan_id;
  if (subscription && !subscription.plan_id && subscription.stripe_subscription_id && subscription.status === 'active') {
    try {
      const stripe = getStripe();
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id, {
        expand: ['items.data'],
      });
      const firstItem = stripeSub.items.data[0];
      if (firstItem) {
        const detected = detectPlanIdFromStripeItem(firstItem);
        if (detected) {
          resolvedPlanId = detected;
          // Persist to DB so this only runs once
          const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (adminUrl && adminKey) {
            const admin = createAdminClient(adminUrl, adminKey);
            await admin.from('subscriptions').update({ plan_id: detected }).eq('business_id', business.id);
            console.info(`[subscription] Backfilled plan_id="${detected}" for business ${business.id}`);
          }
        }
      }
    } catch (err) {
      console.error('[subscription] Failed to backfill plan_id from Stripe:', err);
      // Continue without plan_id — UI will still work, just won't highlight current plan precisely
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />
      <SubscriptionView
        businessId={business.id}
        subscription={subscription ? {
          id: subscription.id,
          tier: subscription.tier,
          plan_id: resolvedPlanId ?? undefined,
          status: subscription.status,
          current_period_end: subscription.current_period_end ?? undefined,
        } : null}
        hasStripeCustomer={!!subscription?.stripe_customer_id}
      />
    </div>
  );
}
