// Address -> coordinates, so lead matching can use real distance instead of
// only comparing state names.
//
// Uses OpenStreetMap's Nominatim: no API key, and it handles the mixed
// international addresses in this data (US ZIPs, Canadian postcodes, Indian
// PIN codes). Geocoding is best-effort by design — a failure must never block
// a business signing up or a customer posting a job, so every entry point
// treats a null result as "no coordinates yet" and falls back to state
// matching.

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'AnyTradesman/1.0 (info@anytradesmen.com)';
const TIMEOUT_MS = 5000;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressParts {
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

// Same address resolves to the same point, so cache within the process to
// avoid repeat lookups (Nominatim asks for max ~1 request/second).
const cache = new Map<string, Coordinates | null>();

function cacheKey(a: AddressParts): string {
  return [a.city, a.state, a.zip_code]
    .map((v) => (v || '').trim().toLowerCase())
    .join('|');
}

async function query(params: Record<string, string>): Promise<Coordinates | null> {
  const url = new URL(NOMINATIM);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results?.length) return null;
    const latitude = parseFloat(results[0].lat);
    const longitude = parseFloat(results[0].lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  } catch {
    return null; // timeout, network error, rate limit — all non-fatal
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve an address to coordinates. Tries the structured lookup first, then
 * a looser free-text search. Returns null when the address can't be resolved.
 */
export async function geocodeAddress(address: AddressParts): Promise<Coordinates | null> {
  const key = cacheKey(address);
  if (!key.replace(/\|/g, '')) return null; // nothing to geocode
  if (cache.has(key)) return cache.get(key)!;

  const city = (address.city || '').trim();
  const state = (address.state || '').trim();
  const zip = (address.zip_code || '').trim();

  let result = await query({ city, state, postalcode: zip });

  // Postal codes in this data are often wrong or in another country's format,
  // so retry on city/state alone before giving up.
  if (!result && (city || state)) {
    result = await query({ city, state });
  }
  if (!result) {
    const freeText = [city, state, zip].filter(Boolean).join(', ');
    if (freeText) result = await query({ q: freeText });
  }

  cache.set(key, result);
  return result;
}

const EARTH_RADIUS_MILES = 3958.8;

/** Great-circle distance in miles between two points. */
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export function toCoordinates(
  row: { latitude?: number | null; longitude?: number | null } | null | undefined
): Coordinates | null {
  if (!row || row.latitude == null || row.longitude == null) return null;
  return { latitude: row.latitude, longitude: row.longitude };
}
