import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendServiceRequestConfirmation, sendNewLeadNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category_id, title, description, address, city, state, zip_code, preferred_date, budget_min, budget_max } = body;

    if (!category_id || !title || !description || !city || !state || !zip_code) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[request/create] Auth error:', authError?.message);
      return NextResponse.json(
        { error: 'You must be logged in to submit a request.' },
        { status: 401 }
      );
    }

    // Use admin client for the insert to bypass RLS
    // (auth is already verified above)
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      console.error('[request/create] Missing Supabase admin credentials');
      return NextResponse.json(
        { error: 'Service configuration error.' },
        { status: 500 }
      );
    }

    const admin = createAdminClient(adminUrl, adminKey);

    const { data: serviceRequest, error: insertError } = await admin
      .from('service_requests')
      .insert({
        customer_id: user.id,
        category_id,
        title,
        description,
        address: address || null,
        city,
        state,
        zip_code,
        preferred_date: preferred_date || null,
        budget_min: budget_min ? parseFloat(budget_min) : null,
        budget_max: budget_max ? parseFloat(budget_max) : null,
        status: 'open',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[request/create] Insert error:', insertError.code, insertError.message, insertError.details, insertError.hint);
      return NextResponse.json(
        { error: 'Failed to submit your request. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email to customer (don't block response)
    admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile?.email) {
          sendServiceRequestConfirmation({
            to: profile.email,
            customerName: profile.full_name || '',
            requestTitle: title,
            requestId: serviceRequest.id,
          }).catch((err) => console.error('[request/create] Customer email failed:', err));
        }
      });

    // Notify matching business owners (don't block response)
    (async () => {
      try {
        // Get category name
        const { data: category } = await admin
          .from('categories')
          .select('name')
          .eq('id', category_id)
          .single();

        // Find businesses with matching category + active subscription
        const { data: businessCategories } = await admin
          .from('business_categories')
          .select('business_id')
          .eq('category_id', category_id);

        if (!businessCategories?.length) return;

        const businessIds = businessCategories.map((bc) => bc.business_id);

        // Get verified businesses with active subscriptions
        const { data: businesses } = await admin
          .from('businesses')
          .select('id, business_name, owner_id')
          .in('id', businessIds)
          .eq('is_active', true)
          .eq('is_verified', true);

        if (!businesses?.length) return;

        // Check subscriptions and get owner emails
        for (const biz of businesses) {
          const { data: sub } = await admin
            .from('subscriptions')
            .select('id')
            .eq('business_id', biz.id)
            .eq('status', 'active')
            .gte('current_period_end', new Date().toISOString())
            .limit(1)
            .single();

          if (!sub) continue;

          const { data: owner } = await admin
            .from('profiles')
            .select('email')
            .eq('id', biz.owner_id)
            .single();

          if (owner?.email) {
            sendNewLeadNotification({
              to: owner.email,
              businessName: biz.business_name,
              requestTitle: title,
              city,
              state,
              category: category?.name || '',
              requestId: serviceRequest.id,
            }).catch((err) => console.error('[request/create] Lead notification failed:', err));
          }
        }
      } catch (err) {
        console.error('[request/create] Lead matching failed:', err);
      }
    })();

    return NextResponse.json({ id: serviceRequest.id });
  } catch (error) {
    console.error('[request/create] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
