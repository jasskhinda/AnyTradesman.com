'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateRequestData {
  category_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  preferred_date: string;
  budget_min: string;
  budget_max: string;
}

export async function createServiceRequest(data: CreateRequestData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to submit a request.' };
  }

  const { data: request, error: insertError } = await supabase
    .from('service_requests')
    .insert({
      customer_id: user.id,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      address: data.address || null,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      preferred_date: data.preferred_date || null,
      budget_min: data.budget_min ? parseFloat(data.budget_min) : null,
      budget_max: data.budget_max ? parseFloat(data.budget_max) : null,
      status: 'open',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Service request insert error:', insertError.message);
    return { error: 'Failed to submit your request. Please try again.' };
  }

  return { id: request.id };
}
