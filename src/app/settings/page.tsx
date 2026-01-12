import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />
      <SettingsForm initialProfile={profile} />
    </div>
  );
}
