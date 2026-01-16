'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface AddCredentialData {
  businessId: string;
  credential_type: string;
  credential_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
}

export async function addCredential(data: AddCredentialData): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Verify user is authenticated and owns the business
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Verify user owns this business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', data.businessId)
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return { error: 'Business not found' };
  }

  const { error: insertError } = await supabase
    .from('business_credentials')
    .insert({
      business_id: data.businessId,
      credential_type: data.credential_type,
      credential_number: data.credential_number || null,
      issuing_authority: data.issuing_authority || null,
      issue_date: data.issue_date || null,
      expiry_date: data.expiry_date || null,
      verification_status: 'pending',
    });

  if (insertError) {
    console.error('Error adding credential:', insertError);
    return { error: insertError.message };
  }

  revalidatePath('/business/credentials');
  return {};
}

export async function deleteCredential(credentialId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Get the credential
  const { data: credential } = await supabase
    .from('business_credentials')
    .select('business_id')
    .eq('id', credentialId)
    .single();

  if (!credential) {
    return { error: 'Credential not found' };
  }

  // Verify user owns the business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', credential.business_id)
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return { error: 'Unauthorized' };
  }

  const { error: deleteError } = await supabase
    .from('business_credentials')
    .delete()
    .eq('id', credentialId);

  if (deleteError) {
    console.error('Error deleting credential:', deleteError);
    return { error: deleteError.message };
  }

  revalidatePath('/business/credentials');
  return {};
}
