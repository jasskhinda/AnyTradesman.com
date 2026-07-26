import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { geocodeAddress } from '@/lib/geocoding';

// Re-resolves a business's coordinates after its address changes, so lead
// matching keeps using real distance. Called after the profile form saves.
export async function POST(request: Request) {
  try {
    const { businessId } = await request.json();
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id, city, state, zip_code')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const coords = await geocodeAddress(business);

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
    }
    const admin = createAdminClient(adminUrl, adminKey);

    await admin
      .from('businesses')
      .update({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      })
      .eq('id', businessId);

    return NextResponse.json({ geocoded: !!coords, ...(coords || {}) });
  } catch (error) {
    console.error('[business/geocode] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
