import { createClient } from '@/lib/supabase/server';
import { Header } from './header';

export async function HeaderWrapper() {
  const supabase = await createClient();

  // Try to get the current user - this works because server client has cookie access
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  return <Header initialUser={profile} />;
}
