import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceRequestForm } from './service-request-form';
import type { Category } from '@/types/database';

export default async function ServiceRequestPage() {
  const supabase = await createClient();

  // Get authenticated user - server side with proper cookies
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirectTo=/request');
  }

  // Fetch user profile for header
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  return (
    <ServiceRequestForm
      userId={user.id}
      userProfile={profile}
      categories={(categories as Category[]) || []}
    />
  );
}
