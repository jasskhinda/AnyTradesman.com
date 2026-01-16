import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CredentialsView } from './credentials-view';
import type { Profile, Business, BusinessCredential } from '@/types/database';

export default async function CredentialsPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch profile for header
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) {
    redirect('/business/setup');
  }

  // Fetch credentials
  const { data: credentials } = await supabase
    .from('business_credentials')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <CredentialsView
      userProfile={profile as Profile | null}
      business={business as Business}
      initialCredentials={(credentials as BusinessCredential[]) || []}
    />
  );
}
