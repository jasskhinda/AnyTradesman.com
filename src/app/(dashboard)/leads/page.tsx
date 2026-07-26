import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadsView } from './leads-view';
import { isSubscriptionCurrent } from '@/lib/subscription';
import { getBusinessCategoryIds, serviceAreaMatches, isSameCity } from '@/lib/leads/matching';
import type { Profile } from '@/types/database';

export interface LeadRow {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  created_at: string;
  categories?: { id: string; name: string };
  has_quoted: boolean;
  is_new: boolean;
  quote_count: number;
  is_local: boolean;
}

const PAGE_SIZE = 12;

interface LeadsPageProps {
  searchParams: Promise<{ tab?: string; q?: string; category?: string; page?: string; area?: string }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const tab = params.tab === 'quoted' ? 'quoted' : 'available';
  const search = (params.q || '').trim();
  const categoryFilter = params.category || '';
  const areaFilter = params.area === 'all' ? 'all' : 'mine';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'business_owner') redirect('/dashboard');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, city, state')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/business/setup');

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('business_id', business.id)
    .maybeSingle();

  const hasActiveSubscription = isSubscriptionCurrent(subscription);

  // The trades this business serves define which leads exist for them at all.
  const myCategoryIds = await getBusinessCategoryIds(supabase, business.id);

  const { data: myCategories } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', myCategoryIds.length ? myCategoryIds : ['00000000-0000-0000-0000-000000000000'])
    .order('name');

  // Which requests this business has already quoted on
  const { data: myQuotes } = await supabase
    .from('quotes')
    .select('service_request_id')
    .eq('business_id', business.id);
  const quotedIds = new Set((myQuotes || []).map((q) => q.service_request_id));

  let leads: LeadRow[] = [];
  let totalCount = 0;

  if (myCategoryIds.length > 0) {
    const wantedCategories =
      categoryFilter && myCategoryIds.includes(categoryFilter) ? [categoryFilter] : myCategoryIds;

    let query = supabase
      .from('service_requests')
      .select(
        'id, title, description, city, state, budget_min, budget_max, preferred_date, created_at, categories(id, name)'
      )
      .eq('status', 'open')
      .in('category_id', wantedCategories)
      .order('created_at', { ascending: false });

    if (search) {
      const safe = search.replace(/[,()\\%]/g, '');
      if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }

    const { data: requests } = await query.limit(300);

    // Service-area + tab filtering. Location lives in messy free-text columns,
    // so this is done in code with normalization rather than SQL equality.
    const inArea = (requests || []).filter((r) =>
      areaFilter === 'all' ? true : serviceAreaMatches(business, r)
    );

    const scoped = inArea.filter((r) =>
      tab === 'quoted' ? quotedIds.has(r.id) : !quotedIds.has(r.id)
    );

    totalCount = scoped.length;
    const pageItems = scoped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Competition signal + "new" flag, batched rather than N+1
    const ids = pageItems.map((r) => r.id);
    const [{ data: quoteRows }, { data: leadRows }] = await Promise.all([
      ids.length
        ? supabase.from('quotes').select('service_request_id').in('service_request_id', ids)
        : Promise.resolve({ data: [] as { service_request_id: string }[] }),
      ids.length
        ? supabase
            .from('leads')
            .select('service_request_id, is_viewed')
            .eq('business_id', business.id)
            .in('service_request_id', ids)
        : Promise.resolve({ data: [] as { service_request_id: string; is_viewed: boolean }[] }),
    ]);

    const quoteCounts = new Map<string, number>();
    for (const q of quoteRows || []) {
      quoteCounts.set(q.service_request_id, (quoteCounts.get(q.service_request_id) || 0) + 1);
    }
    const viewedMap = new Map((leadRows || []).map((l) => [l.service_request_id, l.is_viewed]));

    leads = pageItems.map((r) => {
      const category = Array.isArray(r.categories) ? r.categories[0] : r.categories;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        city: r.city,
        state: r.state,
        budget_min: r.budget_min,
        budget_max: r.budget_max,
        preferred_date: r.preferred_date,
        created_at: r.created_at,
        categories: category ? { id: category.id, name: category.name } : undefined,
        has_quoted: quotedIds.has(r.id),
        is_new: viewedMap.get(r.id) === false,
        quote_count: quoteCounts.get(r.id) || 0,
        is_local: isSameCity(business, r),
      };
    });
  }

  return (
    <LeadsView
      userProfile={profile as Profile | null}
      leads={leads}
      myCategories={myCategories || []}
      hasActiveSubscription={hasActiveSubscription}
      hasCategories={myCategoryIds.length > 0}
      businessArea={[business.city, business.state].filter(Boolean).join(', ')}
      tab={tab}
      search={search}
      categoryFilter={categoryFilter}
      areaFilter={areaFilter}
      page={page}
      pageSize={PAGE_SIZE}
      totalCount={totalCount}
      quotedCount={quotedIds.size}
    />
  );
}
