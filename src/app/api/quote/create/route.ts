import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendQuoteReceivedEmail } from '@/lib/email';
import { isSubscriptionCurrent } from '@/lib/subscription';
import { getBusinessCategoryIds } from '@/lib/leads/matching';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { service_request_id, amount, message, estimated_duration } = body;

    if (!service_request_id || !amount) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!adminUrl || !adminKey) {
      return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
    }

    const admin = createAdminClient(adminUrl, adminKey);

    // Verify the user owns a business
    const { data: business } = await admin
      .from('businesses')
      .select('id, name')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business account required.' }, { status: 403 });
    }

    // Sending quotes is a paid feature — require a currently-valid subscription
    const { data: subRow } = await admin
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('business_id', business.id)
      .maybeSingle();

    if (!isSubscriptionCurrent(subRow)) {
      return NextResponse.json(
        { error: 'An active subscription is required to send quotes. Renew your plan to continue.' },
        { status: 403 }
      );
    }

    // The request must still be open, and must be in a trade this business
    // serves — the same rule that decides what appears in their leads feed.
    const { data: targetRequest } = await admin
      .from('service_requests')
      .select('id, status, category_id')
      .eq('id', service_request_id)
      .maybeSingle();

    if (!targetRequest) {
      return NextResponse.json({ error: 'This request no longer exists.' }, { status: 404 });
    }
    if (targetRequest.status !== 'open') {
      return NextResponse.json(
        { error: 'This request is no longer accepting quotes.' },
        { status: 400 }
      );
    }

    const myCategoryIds = await getBusinessCategoryIds(admin, business.id);
    if (!myCategoryIds.includes(targetRequest.category_id)) {
      return NextResponse.json(
        { error: 'This job is outside the services your business offers.' },
        { status: 403 }
      );
    }

    // Insert the quote
    const { error: insertError } = await admin
      .from('quotes')
      .insert({
        service_request_id,
        business_id: business.id,
        amount: parseFloat(String(amount)),
        description: message || null,
        estimated_duration: estimated_duration || null,
        status: 'pending',
      });

    if (insertError) {
      console.error('[quote/create] Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Record that this business responded to the lead (best effort)
    await admin.from('leads').upsert(
      {
        business_id: business.id,
        service_request_id,
        is_viewed: true,
        is_contacted: true,
      },
      { onConflict: 'business_id,service_request_id' }
    );

    // Fetch request + customer details for email (don't block response)
    admin
      .from('service_requests')
      .select('id, title, customer_id')
      .eq('id', service_request_id)
      .single()
      .then(async ({ data: req }) => {
        if (!req) return;
        const { data: profile } = await admin
          .from('profiles')
          .select('full_name, email')
          .eq('id', req.customer_id)
          .single();
        if (profile?.email) {
          sendQuoteReceivedEmail({
            to: profile.email,
            customerName: profile.full_name || '',
            businessName: business.name,
            requestTitle: req.title,
            amount: parseFloat(String(amount)),
            requestId: req.id,
          }).catch((err) => console.error('[quote/create] Email failed:', err));
        }
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[quote/create] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
