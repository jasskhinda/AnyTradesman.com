import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendQuoteStatusEmail } from '@/lib/email';

// Customers accept or decline a quote on their own service request.
// RLS only allows business owners to update quotes, so this goes through
// the admin client after verifying the caller owns the request.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote_id, action } = body;

    if (!quote_id || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
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

    // Load the quote with its request and business
    const { data: quote, error: quoteError } = await admin
      .from('quotes')
      .select('id, status, amount, service_request_id, business_id, service_requests(id, title, customer_id, status), businesses(id, name, owner_id)')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    }

    const serviceRequest = Array.isArray(quote.service_requests)
      ? quote.service_requests[0]
      : quote.service_requests;
    const business = Array.isArray(quote.businesses)
      ? quote.businesses[0]
      : quote.businesses;

    // Only the customer who owns the request can respond
    if (!serviceRequest || serviceRequest.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['pending', 'sent'].includes(quote.status)) {
      return NextResponse.json(
        { error: 'This quote has already been responded to.' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      const { error: acceptError } = await admin
        .from('quotes')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', quote.id);

      if (acceptError) {
        console.error('[quote/respond] Accept error:', acceptError);
        return NextResponse.json({ error: 'Failed to accept quote.' }, { status: 500 });
      }

      // Move the request forward
      await admin
        .from('service_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', serviceRequest.id);
    } else {
      const { error: declineError } = await admin
        .from('quotes')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', quote.id);

      if (declineError) {
        console.error('[quote/respond] Decline error:', declineError);
        return NextResponse.json({ error: 'Failed to decline quote.' }, { status: 500 });
      }
    }

    // Notify the business owner (don't block response)
    if (business) {
      admin
        .from('profiles')
        .select('email')
        .eq('id', business.owner_id)
        .single()
        .then(({ data: owner }) => {
          if (owner?.email) {
            sendQuoteStatusEmail({
              to: owner.email,
              businessName: business.name,
              requestTitle: serviceRequest.title,
              amount: Number(quote.amount),
              accepted: action === 'accept',
            }).catch((err) => console.error('[quote/respond] Email failed:', err));
          }
        });
    }

    return NextResponse.json({ success: true, status: action === 'accept' ? 'accepted' : 'rejected' });
  } catch (error) {
    console.error('[quote/respond] Unexpected error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
