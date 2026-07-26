import type { SupabaseClient } from '@supabase/supabase-js';
import { isSubscriptionCurrent } from '@/lib/subscription';

// Single source of truth for "which businesses should see which request".
// Both the /leads feed and the new-lead notification emails use this, so a
// business is never emailed about a job it cannot find in the app (and vice
// versa).
//
// A business matches a request when ALL of these hold:
//   1. the request's category is one the business serves
//   2. the business is active and has a current subscription
//   3. the request is in the business's service area
//
// Service area: latitude/longitude are not populated (no geocoding yet), so
// radius matching is impossible. We match on state, which is the coarsest
// reliable signal in the data we actually have, and treat a missing state on
// either side as "no location constraint" rather than dropping the match.
// When geocoding lands, swap serviceAreaMatches() for a radius test.

export function normalizeLocation(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function serviceAreaMatches(
  business: { state?: string | null; city?: string | null },
  request: { state?: string | null; city?: string | null }
): boolean {
  const bState = normalizeLocation(business.state);
  const rState = normalizeLocation(request.state);
  // Unknown location on either side -> don't filter it out
  if (!bState || !rState) return true;
  return bState === rState;
}

// True when the request is in the same city as the business — used only to
// rank more-local jobs higher, never to exclude.
export function isSameCity(
  business: { city?: string | null },
  request: { city?: string | null }
): boolean {
  const b = normalizeLocation(business.city);
  const r = normalizeLocation(request.city);
  return !!b && b === r;
}

export interface MatchableBusiness {
  id: string;
  name: string;
  owner_id: string;
  city: string | null;
  state: string | null;
  is_active: boolean | null;
}

/**
 * Businesses that should be notified about (and can see) a given request.
 * Uses an admin/service client because it reads across all businesses.
 */
export async function findMatchingBusinesses(
  admin: SupabaseClient,
  request: { category_id: string; city?: string | null; state?: string | null }
): Promise<MatchableBusiness[]> {
  const { data: categoryRows, error: catError } = await admin
    .from('business_categories')
    .select('business_id')
    .eq('category_id', request.category_id);

  if (catError || !categoryRows?.length) return [];

  const businessIds = Array.from(new Set(categoryRows.map((r) => r.business_id)));

  const { data: businesses, error: bizError } = await admin
    .from('businesses')
    .select('id, name, owner_id, city, state, is_active')
    .in('id', businessIds)
    .eq('is_active', true);

  if (bizError || !businesses?.length) return [];

  const inArea = businesses.filter((b) => serviceAreaMatches(b, request));
  if (!inArea.length) return [];

  // Only businesses with a live subscription get leads (single query, not N)
  const { data: subs } = await admin
    .from('subscriptions')
    .select('business_id, status, current_period_end')
    .in('business_id', inArea.map((b) => b.id));

  const subscribed = new Set(
    (subs || []).filter((s) => isSubscriptionCurrent(s)).map((s) => s.business_id)
  );

  return inArea.filter((b) => subscribed.has(b.id));
}

/**
 * Category ids a business serves. Returns [] when none are configured, which
 * callers must treat as "no leads yet" (prompt the business to pick trades)
 * rather than "show everything".
 */
export async function getBusinessCategoryIds(
  supabase: SupabaseClient,
  businessId: string
): Promise<string[]> {
  const { data } = await supabase
    .from('business_categories')
    .select('category_id')
    .eq('business_id', businessId);

  return (data || []).map((r) => r.category_id);
}
