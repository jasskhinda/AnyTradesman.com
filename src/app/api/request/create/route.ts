import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[request/create] Auth error:', authError?.message);
      return NextResponse.json(
        { error: 'You must be logged in to submit a request.' },
        { status: 401 }
      );
    }

    const { data: serviceRequest, error: insertError } = await supabase
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

    return NextResponse.json({ id: serviceRequest.id });
  } catch (error) {
    console.error('[request/create] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
