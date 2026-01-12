import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { ChangePasswordForm } from './change-password-form';

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />
      <ChangePasswordForm />
    </div>
  );
}
