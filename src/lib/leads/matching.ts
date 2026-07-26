import type { SupabaseClient } from '@supabase/supabase-js';
import { isSubscriptionCurrent } from '@/lib/subscription';
import { distanceMiles, toCoordinates, type Coordinates } from '@/lib/geocoding';

// Single source of truth for "which businesses should see which request".
// Both the /leads feed and the new-lead notification emails use this, so a
// business is never emailed about a job it cannot find in the app.
//
// A business matches a request when ALL of these hold:
//   1. the request's category is one the business serves
//   2. the business is active and has a current subscription
//   3. the request is inside the business's service area
//
// Service area is measured two ways, best available first:
//   - DISTANCE: when both sides are geocoded, the job must fall inside the
//     business's service_radius_miles.
//   - STATE: when either side has no coordinates (geocoding can fail, and
//     older rows predate it), fall back to comparing state names.
// Degrading to state matching keeps a business receiving leads instead of
// silently going dark because one address could not be resolved.

export const DEFAULT_SERVICE_RADIUS_MILES = 25;

// A strict radius strands real work: a handyman in Fishers would never see a
// job in Trafalgar (37 mi) even though they'd happily drive it, and if nobody
// is inside the radius the customer gets no quotes at all. So area matching
// has two tiers:
//   - "primary"  : inside the business's own radius
//   - "extended" : beyond the radius but still realistically drivable
// Extended leads appear in the feed clearly labelled with their distance, and
// are only emailed when nothing matched inside the radius, so nobody is
// spammed but no request goes nowhere.
export const EXTENDED_AREA_MULTIPLIER = 2.5;
export const EXTENDED_AREA_MIN_MILES = 60;
export const EXTENDED_AREA_MAX_MILES = 150;

export function extendedRadiusFor(radiusMiles: number): number {
  return Math.min(
    EXTENDED_AREA_MAX_MILES,
    Math.max(EXTENDED_AREA_MIN_MILES, radiusMiles * EXTENDED_AREA_MULTIPLIER)
  );
}

export function normalizeLocation(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function statesMatch(
  business: { state?: string | null },
  request: { state?: string | null }
): boolean {
  const b = normalizeLocation(business.state);
  const r = normalizeLocation(request.state);
  // Unknown location on either side -> don't exclude
  if (!b || !r) return true;
  return b === r;
}

export interface LocatableBusiness {
  state?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  service_radius_miles?: number | null;
}

export interface LocatableRequest {
  state?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type AreaTier = 'primary' | 'extended' | 'out_of_area';

export interface AreaMatch {
  /** True for primary or extended — i.e. the business may see this lead. */
  matches: boolean;
  tier: AreaTier;
  /** Distance in miles when both sides are geocoded, otherwise null. */
  distance: number | null;
  /** How the decision was made — useful for UI copy and debugging. */
  basis: 'distance' | 'state';
}

export function evaluateServiceArea(
  business: LocatableBusiness,
  request: LocatableRequest
): AreaMatch {
  const bCoords: Coordinates | null = toCoordinates(business);
  const rCoords: Coordinates | null = toCoordinates(request);

  if (bCoords && rCoords) {
    const distance = distanceMiles(bCoords, rCoords);
    const radius = business.service_radius_miles ?? DEFAULT_SERVICE_RADIUS_MILES;
    const tier: AreaTier =
      distance <= radius
        ? 'primary'
        : distance <= extendedRadiusFor(radius)
        ? 'extended'
        : 'out_of_area';
    return { matches: tier !== 'out_of_area', tier, distance, basis: 'distance' };
  }

  // No coordinates: fall back to state, treated as primary so behaviour
  // matches what it was before geocoding existed.
  const sameState = statesMatch(business, request);
  return {
    matches: sameState,
    tier: sameState ? 'primary' : 'out_of_area',
    distance: null,
    basis: 'state',
  };
}

/** Kept for callers that only need a boolean. */
export function serviceAreaMatches(
  business: LocatableBusiness,
  request: LocatableRequest
): boolean {
  return evaluateServiceArea(business, request).matches;
}

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
  latitude: number | null;
  longitude: number | null;
  service_radius_miles: number | null;
  is_active: boolean | null;
  /** Distance from the request, when both are geocoded. */
  distance: number | null;
  /** 'primary' = inside their radius, 'extended' = drivable but further out. */
  tier: AreaTier;
}

/**
 * Businesses that should be notified about (and can see) a given request,
 * nearest first when distances are known.
 */
export async function findMatchingBusinesses(
  admin: SupabaseClient,
  request: { category_id: string } & LocatableRequest
): Promise<MatchableBusiness[]> {
  const { data: categoryRows, error: catError } = await admin
    .from('business_categories')
    .select('business_id')
    .eq('category_id', request.category_id);

  if (catError || !categoryRows?.length) return [];

  const businessIds = Array.from(new Set(categoryRows.map((r) => r.business_id)));

  const { data: businesses, error: bizError } = await admin
    .from('businesses')
    .select('id, name, owner_id, city, state, latitude, longitude, service_radius_miles, is_active')
    .in('id', businessIds)
    .eq('is_active', true);

  if (bizError || !businesses?.length) return [];

  const inArea: MatchableBusiness[] = [];
  for (const b of businesses) {
    const area = evaluateServiceArea(b, request);
    if (area.matches) inArea.push({ ...b, distance: area.distance, tier: area.tier });
  }
  if (!inArea.length) return [];

  // Only businesses with a live subscription get leads (one query, not N)
  const { data: subs } = await admin
    .from('subscriptions')
    .select('business_id, status, current_period_end')
    .in('business_id', inArea.map((b) => b.id));

  const subscribed = new Set(
    (subs || []).filter((s) => isSubscriptionCurrent(s)).map((s) => s.business_id)
  );

  return inArea
    .filter((b) => subscribed.has(b.id))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === 'primary' ? -1 : 1;
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1; // known distances rank first
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
}

/**
 * Who should actually be emailed about a new request: everyone whose own
 * service area covers it, or — when that is nobody — the nearest businesses
 * just outside it, so a request is never left with no one to answer it.
 */
export function selectBusinessesToNotify(
  matches: MatchableBusiness[]
): MatchableBusiness[] {
  const primary = matches.filter((b) => b.tier === 'primary');
  if (primary.length) return primary;
  return matches.filter((b) => b.tier === 'extended');
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
