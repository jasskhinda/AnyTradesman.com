import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MyRequestsView } from './my-requests-view';
import type { Profile } from '@/types/database';

interface ServiceRequest {
  id: string;
  title: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  categories?: {
    name: string;
  };
  quote_count?: number;
}

export default async function MyRequestsPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch user profile for header
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Load service requests with quote counts
  const { data: requestsData } = await supabase
    .from('service_requests')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  let requests: ServiceRequest[] = [];

  if (requestsData) {
    // Get quote counts for each request
    const requestsWithCounts = await Promise.all(
      requestsData.map(async (request: ServiceRequest) => {
        const { count } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('service_request_id', request.id);

        return {
          ...request,
          quote_count: count || 0,
        };
      })
    );

    requests = requestsWithCounts;
  }

  return (
    <MyRequestsView
      userProfile={profile as Profile | null}
      initialRequests={requests}
    />
  );
}
