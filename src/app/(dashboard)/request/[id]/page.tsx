import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RequestDetailView } from './request-detail-view';
import type { Profile } from '@/types/database';

interface RequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailsPage({ params }: RequestPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Customers only ever see their own requests here
  const { data: request } = await supabase
    .from('service_requests')
    .select('*, categories(name)')
    .eq('id', id)
    .eq('customer_id', user.id)
    .maybeSingle();

  if (!request) notFound();

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, businesses(id, name, slug, rating_average, rating_count, is_verified)')
    .eq('service_request_id', id)
    .order('created_at', { ascending: false });

  // How far the request reached (RLS lets customers read the reach of their
  // own request, not which businesses those are)
  const { data: reachRows } = await supabase
    .from('leads')
    .select('is_viewed')
    .eq('service_request_id', id);

  const reach = reachRows
    ? {
        notified: reachRows.length,
        viewed: reachRows.filter((l: { is_viewed: boolean | null }) => l.is_viewed).length,
      }
    : null;

  const category = Array.isArray(request.categories) ? request.categories[0] : request.categories;

  return (
    <RequestDetailView
      userProfile={profile as Profile | null}
      initialRequest={{ ...request, categories: category ?? undefined }}
      initialQuotes={(quotes ?? []).map((q) => ({
        ...q,
        businesses: Array.isArray(q.businesses) ? q.businesses[0] : q.businesses,
      }))}
      reach={reach}
    />
  );
}
