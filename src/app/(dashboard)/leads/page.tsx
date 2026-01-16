import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadsView } from './leads-view';
import type { Profile } from '@/types/database';

interface Category {
  id: string;
  name: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  zip_code: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  categories?: {
    id: string;
    name: string;
  };
  has_quoted?: boolean;
}

export default async function LeadsPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Check if user is a business owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'business_owner') {
    redirect('/dashboard');
  }

  // Get the business for this user
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  let myCategories: Category[] = [];
  let leads: ServiceRequest[] = [];

  if (business) {
    // Get categories this business serves
    const { data: businessCategories } = await supabase
      .from('business_categories')
      .select('categories (id, name)')
      .eq('business_id', business.id);

    if (businessCategories) {
      myCategories = businessCategories
        .map((bc: { categories: Category | Category[] | null }) => {
          if (Array.isArray(bc.categories)) {
            return bc.categories[0] || null;
          }
          return bc.categories;
        })
        .filter((c: Category | null): c is Category => c !== null);
    }

    // Load open service requests
    const { data: requestsData } = await supabase
      .from('service_requests')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (requestsData) {
      // Check which requests we've already quoted
      const requestIds = requestsData.map((r: ServiceRequest) => r.id);

      if (requestIds.length > 0) {
        const { data: existingQuotes } = await supabase
          .from('quotes')
          .select('service_request_id')
          .eq('business_id', business.id)
          .in('service_request_id', requestIds);

        const quotedRequestIds = new Set(existingQuotes?.map((q: { service_request_id: string }) => q.service_request_id) || []);

        leads = requestsData.map((request: ServiceRequest) => ({
          ...request,
          has_quoted: quotedRequestIds.has(request.id),
        }));
      } else {
        leads = requestsData;
      }
    }
  }

  return (
    <LeadsView
      userProfile={profile as Profile}
      businessId={business?.id || null}
      myCategories={myCategories}
      initialLeads={leads}
    />
  );
}
