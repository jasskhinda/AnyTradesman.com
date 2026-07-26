import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendServiceRequestConfirmation, sendNewLeadNotification } from '@/lib/email';
import { findMatchingBusinesses } from '@/lib/leads/matching';

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

    // Match the request to businesses, record the leads, and notify them.
    // Awaited so the work completes before the serverless function freezes.
    let matchedCount = 0;
    try {
      const matches = await findMatchingBusinesses(admin, {
        category_id,
        city,
        state,
      });
      matchedCount = matches.length;

      if (matches.length) {
        // Materialize the leads so businesses have an inbox and customers can
        // see how many pros their request reached.
        const { error: leadsError } = await admin.from('leads').insert(
          matches.map((b) => ({
            business_id: b.id,
            service_request_id: serviceRequest.id,
          }))
        );
        if (leadsError) {
          console.error('[request/create] Lead insert failed:', leadsError.message);
        }

        const { data: category } = await admin
          .from('categories')
          .select('name')
          .eq('id', category_id)
          .single();

        const { data: owners } = await admin
          .from('profiles')
          .select('id, email')
          .in('id', Array.from(new Set(matches.map((b) => b.owner_id))));

        const emailByOwner = new Map((owners || []).map((o) => [o.id, o.email]));

        await Promise.all(
          matches.map((biz) => {
            const to = emailByOwner.get(biz.owner_id);
            if (!to) return Promise.resolve();
            return sendNewLeadNotification({
              to,
              businessName: biz.name,
              requestTitle: title,
              city,
              state,
              category: category?.name || '',
              requestId: serviceRequest.id,
            }).catch((err) =>
              console.error('[request/create] Lead notification failed:', err)
            );
          })
        );
      }
    } catch (err) {
      console.error('[request/create] Lead matching failed:', err);
    }

    return NextResponse.json({ id: serviceRequest.id, matched: matchedCount });
  } catch (error) {
    console.error('[request/create] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
