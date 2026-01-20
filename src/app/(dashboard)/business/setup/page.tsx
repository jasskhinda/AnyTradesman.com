import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BusinessSetupForm } from './business-setup-form';
import type { Category, Profile } from '@/types/database';

// Onboarding data from the signup flow
interface OnboardingData {
  businessName?: string;
  phone?: string;
  service?: string;
  zipCode?: string;
}

export default async function BusinessSetupPage() {
  const supabase = await createClient();

  // Get authenticated user - server side with proper cookies
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Check if user already has a business - redirect if so
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (existingBusiness) {
    redirect('/business');
  }

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  // Extract onboarding data from user metadata (set during signup)
  const onboardingData: OnboardingData = {
    businessName: user.user_metadata?.onboarding_business_name,
    phone: user.user_metadata?.onboarding_phone,
    service: user.user_metadata?.onboarding_service,
    zipCode: user.user_metadata?.onboarding_zip,
  };

  return (
    <BusinessSetupForm
      userId={user.id}
      userProfile={profile as Profile | null}
      categories={(categories as Category[]) || []}
      userEmail={user.email || profile?.email || ''}
      onboardingData={onboardingData}
    />
  );
}
