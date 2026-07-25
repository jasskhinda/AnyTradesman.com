// Shared definition of "this business currently has paid access".
//
// A subscription grants access while its status is 'active' AND, when a
// period end is recorded, that period (plus a small grace window for webhook
// lag) has not passed. The period check guards against a missed
// customer.subscription.deleted webhook leaving a stale 'active' row behind —
// without it, a business whose plan ended could keep paid access forever.

const EXPIRY_GRACE_MS = 24 * 60 * 60 * 1000; // 1 day for renewal/webhook lag

export interface SubscriptionAccessRow {
  status: string | null;
  current_period_end: string | null;
}

export function isSubscriptionCurrent(
  sub: SubscriptionAccessRow | null | undefined
): boolean {
  if (!sub || sub.status !== 'active') return false;
  if (!sub.current_period_end) return true; // legacy rows without period data
  return new Date(sub.current_period_end).getTime() + EXPIRY_GRACE_MS > Date.now();
}
