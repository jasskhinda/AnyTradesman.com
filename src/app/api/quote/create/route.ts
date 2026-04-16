import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendQuoteReceivedEmail } from '@/lib/email';

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
      .select('id, business_name')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business account required.' }, { status: 403 });
    }

    // Insert the quote
    const { error: insertError } = await admin
      .from('quotes')
      .insert({
        service_request_id,
        business_id: business.id,
        amount: parseFloat(String(amount)),
        message: message || null,
        estimated_duration: estimated_duration || null,
        status: 'pending',
      });

    if (insertError) {
      console.error('[quote/create] Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

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
            businessName: business.business_name,
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
