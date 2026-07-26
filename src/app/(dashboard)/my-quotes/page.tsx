import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MyQuotesView, type MyQuote } from './my-quotes-view';
import type { Profile } from '@/types/database';

export default async function MyQuotesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/dashboard');

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, service_requests(id, title, city, state, status, categories(name))')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const rows: MyQuote[] = (quotes ?? []).map((q) => {
    const req = Array.isArray(q.service_requests) ? q.service_requests[0] : q.service_requests;
    const category = req && (Array.isArray(req.categories) ? req.categories[0] : req.categories);
    return {
      ...q,
      service_requests: { ...req, categories: category ?? undefined },
    };
  });

  return <MyQuotesView userProfile={profile as Profile | null} quotes={rows} />;
}
