import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { SubscriptionView } from './subscription-view';

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) {
    redirect('/business/setup');
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, tier, status, current_period_end')
    .eq('business_id', business.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />
      <SubscriptionView
        businessId={business.id}
        subscription={subscription}
      />
    </div>
  );
}
