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

  // Fetch subscription (include stripe fields for portal and backfill).
  // Note: cancel_at_period_end is intentionally NOT selected here — we read it
  // live from Stripe below, so the page works even before that column's
  // migration has run.
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, tier, plan_id, status, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('business_id', business.id)
    .maybeSingle();

  let resolvedPlanId = subscription?.plan_id;
  // Authoritative billing state comes from Stripe, not our DB copy — a missed
  // webhook must never make the page lie about whether a plan is canceling.
  let cancelAtPeriodEnd = false;
  let periodEnd = subscription?.current_period_end ?? undefined;

  // For any active subscription, reconcile against Stripe on load: pick up
  // cancel_at_period_end, the real period-end date, and backfill plan_id.
  if (subscription && subscription.stripe_subscription_id && subscription.status === 'active') {
    try {
      const stripe = getStripe();
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id, {
        expand: ['items.data'],
      });

      const firstItem = stripeSub.items.data[0];

      // A subscription is "canceling" if the classic cancel_at_period_end flag
      // is set OR (with the next-gen billing portal) a cancel_at timestamp is
      // scheduled. Either way the plan will NOT renew.
      const scheduledCancelTs = stripeSub.cancel_at ?? null;
      cancelAtPeriodEnd = stripeSub.cancel_at_period_end === true || scheduledCancelTs != null;

      // Show the date the plan actually ends (cancel_at) when canceling,
      // otherwise the next renewal date (period end).
      const endTs = scheduledCancelTs ?? firstItem?.current_period_end;
      if (endTs) {
        periodEnd = new Date(endTs * 1000).toISOString();
      }

      const detected = firstItem ? detectPlanIdFromStripeItem(firstItem) : null;
      if (detected && !subscription.plan_id) {
        resolvedPlanId = detected;
      }

      // Persist any drift back to our DB so lists/emails stay consistent
      const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (adminUrl && adminKey) {
        const admin = createAdminClient(adminUrl, adminKey);
        const patch: Record<string, unknown> = { cancel_at_period_end: cancelAtPeriodEnd };
        if (periodEnd) patch.current_period_end = periodEnd;
        if (detected && !subscription.plan_id) patch.plan_id = detected;
        await admin.from('subscriptions').update(patch).eq('business_id', business.id);
      }
    } catch (err) {
      console.error('[subscription] Failed to reconcile subscription from Stripe:', err);
      // Fall back to DB values — UI still works, may be slightly stale
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
          current_period_end: periodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
        } : null}
        hasStripeCustomer={!!subscription?.stripe_customer_id}
      />
    </div>
  );
}
