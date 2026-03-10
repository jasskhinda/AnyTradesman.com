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

  // Server-side validation
  const name = data.name.trim();
  if (name.length < 2 || name.length > 100) {
    return { error: 'Business name must be between 2 and 100 characters.' };
  }

  if (data.phone && !/^\d{3}-?\d{3}-?\d{4}$/.test(data.phone.replace(/[\s()]/g, ''))) {
    return { error: 'Please enter a valid 10-digit phone number.' };
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (data.zip_code && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
    return { error: 'Please enter a valid ZIP code.' };
  }

  // Generate slug from name with uniqueness check
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data: existingSlug } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existingSlug) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

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

  // Redirect to subscription page (required step)
  redirect('/business/subscription');
}
