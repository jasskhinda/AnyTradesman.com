import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isSubscriptionCurrent } from '@/lib/subscription';
import { getBusinessCategoryIds } from '@/lib/leads/matching';
import { LeadDetailView } from './lead-detail-view';
import type { Profile } from '@/types/database';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailsPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'business_owner') redirect('/dashboard');

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/business/setup');

  // Never send the street address or customer id to the client here — the
  // street address is only relevant once the job is won, and customer identity
  // is gated behind having quoted.
  const { data: lead } = await supabase
    .from('service_requests')
    .select(
      'id, customer_id, category_id, title, description, city, state, zip_code, preferred_date, budget_min, budget_max, status, created_at, categories(name)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!lead) notFound();

  // A business may only open leads in a trade it serves.
  const myCategoryIds = await getBusinessCategoryIds(supabase, business.id);
  if (!myCategoryIds.includes(lead.category_id)) {
    redirect('/leads');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('business_id', business.id)
    .maybeSingle();
  const hasActiveSubscription = isSubscriptionCurrent(subscription);

  const { data: existingQuote } = await supabase
    .from('quotes')
    .select('id, amount, description, estimated_duration, status, created_at')
    .eq('service_request_id', id)
    .eq('business_id', business.id)
    .maybeSingle();

  // Customer contact details are the paid unlock: only after a quote is sent.
  let customerContact: { full_name: string | null; email: string; phone: string | null } | null = null;
  if (existingQuote) {
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (adminUrl && adminKey) {
      const admin = createAdminClient(adminUrl, adminKey);
      const { data: contact } = await admin
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', lead.customer_id)
        .maybeSingle();
      customerContact = contact ?? null;
    }
  }

  const { count: quoteCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('service_request_id', id);

  // Mark this lead as viewed (best effort — powers "new" badges and the
  // customer-facing "viewed by N pros" count).
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (adminUrl && adminKey) {
    const admin = createAdminClient(adminUrl, adminKey);
    await admin
      .from('leads')
      .upsert(
        { business_id: business.id, service_request_id: id, is_viewed: true },
        { onConflict: 'business_id,service_request_id' }
      );
  }

  const category = Array.isArray(lead.categories) ? lead.categories[0] : lead.categories;

  return (
    <LeadDetailView
      userProfile={profile as Profile | null}
      lead={{
        id: lead.id,
        title: lead.title,
        description: lead.description,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zip_code,
        preferred_date: lead.preferred_date,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        status: lead.status,
        created_at: lead.created_at,
        category_name: category?.name ?? null,
      }}
      existingQuote={existingQuote ?? null}
      customerContact={customerContact}
      hasActiveSubscription={hasActiveSubscription}
      quoteCount={quoteCount ?? 0}
    />
  );
}
