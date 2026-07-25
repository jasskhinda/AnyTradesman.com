import type { SupabaseClient, User } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

// Shared post-verification bookkeeping used by both the email-confirmation
// route (/api/auth/verify) and the OAuth/code callback (/api/auth/callback):
// make sure a profile row exists, send the welcome email exactly once, and
// keep profiles.email in sync with the auth email.
export async function ensureProfileAndWelcome(
  supabase: SupabaseClient
): Promise<User | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[post-verify] Could not load user:', userError?.message);
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile && user.email) {
    const role = user.user_metadata?.role || 'customer';
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: user.user_metadata?.avatar_url || null,
      role,
    });

    if (insertError) {
      console.error('[post-verify] Profile creation error:', insertError.message);
      // Continue anyway — user is authenticated, profile can be created later
    } else {
      sendWelcomeEmail({
        to: user.email,
        name: fullName || '',
        role: role === 'business_owner' ? 'business_owner' : 'customer',
      }).catch((err) => console.error('[post-verify] Welcome email failed:', err));
    }
  }

  if (profile && user.email) {
    await supabase
      .from('profiles')
      .update({ email: user.email })
      .eq('id', user.id)
      .neq('email', user.email);
  }

  return user;
}
