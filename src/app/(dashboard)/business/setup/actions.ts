'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface CreateBusinessData {
  userId: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  service_radius_miles: number;
  selectedCategories: string[];
}

export async function createBusiness(data: CreateBusinessData): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.id !== data.userId) {
    return { error: 'Unauthorized' };
  }

  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: data.userId,
      name: data.name,
      slug,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      service_radius_miles: data.service_radius_miles,
      is_verified: false,
      verification_status: 'pending',
      is_active: true,
    })
    .select()
    .single();

  if (businessError) {
    console.error('Error creating business:', businessError);
    return { error: businessError.message };
  }

  // Add categories
  if (data.selectedCategories.length > 0) {
    const { error: catError } = await supabase
      .from('business_categories')
      .insert(data.selectedCategories.map(catId => ({
        business_id: business.id,
        category_id: catId,
      })));

    if (catError) {
      console.error('Error adding categories:', catError);
      // Continue anyway - business was created
    }
  }

  // Redirect to credentials page
  redirect('/business/credentials');
}
