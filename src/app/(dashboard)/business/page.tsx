import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { BusinessForm } from './business-form';
import { BusinessSetupPrompt } from './business-setup-prompt';

export default async function BusinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has business owner role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'business_owner') {
    redirect('/dashboard');
  }

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Fetch business categories if business exists
  let businessCategoryIds: string[] = [];
  if (business) {
    const { data: bizCats } = await supabase
      .from('business_categories')
      .select('category_id')
      .eq('business_id', business.id);

    if (bizCats) {
      businessCategoryIds = bizCats.map((bc: { category_id: string }) => bc.category_id);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />
      {business ? (
        <BusinessForm
          initialBusiness={business}
          categories={categories || []}
          initialBusinessCategories={businessCategoryIds}
        />
      ) : (
        <BusinessSetupPrompt />
      )}
    </div>
  );
}
