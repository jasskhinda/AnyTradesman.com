import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { isSubscriptionCurrent } from '@/lib/subscription';
import { getBusinessCategoryIds } from '@/lib/leads/matching';
import { QuoteForm } from './quote-form';

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function SendQuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!business) redirect('/business/setup');

  // Quoting is a paid action — send non-subscribers to plans rather than
  // letting them fill in the whole form and hit a 403 on submit.
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('business_id', business.id)
    .maybeSingle();

  if (!isSubscriptionCurrent(subscription)) {
    redirect('/business/subscription');
  }

  const { data: lead } = await supabase
    .from('service_requests')
    .select('id, title, city, state, budget_min, budget_max, category_id, categories(name)')
    .eq('id', id)
    .eq('status', 'open')
    .maybeSingle();

  if (!lead) redirect('/leads');

  // Only quote jobs in a trade this business serves
  const myCategoryIds = await getBusinessCategoryIds(supabase, business.id);
  if (!myCategoryIds.includes(lead.category_id)) redirect('/leads');

  // One quote per business per request
  const { data: existingQuote } = await supabase
    .from('quotes')
    .select('id')
    .eq('service_request_id', id)
    .eq('business_id', business.id)
    .maybeSingle();

  if (existingQuote) redirect(`/leads/${id}`);

  const category = Array.isArray(lead.categories) ? lead.categories[0] : lead.categories;

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/leads/${lead.id}`}
          className="inline-flex items-center text-neutral-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lead Details
        </Link>

        {/* Lead summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                {category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400 mb-2">
                    {category.name}
                  </span>
                )}
                <h2 className="font-medium text-white">{lead.title}</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {lead.city}, {lead.state}
                </p>
              </div>
              {(lead.budget_min || lead.budget_max) && (
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Customer Budget</p>
                  <p className="text-neutral-300">
                    {lead.budget_min && lead.budget_max
                      ? `$${lead.budget_min} - $${lead.budget_max}`
                      : lead.budget_min
                      ? `From $${lead.budget_min}`
                      : `Up to $${lead.budget_max}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <QuoteForm leadId={lead.id} />

        <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <h3 className="font-medium text-green-400 mb-2">After Sending Your Quote</h3>
          <p className="text-sm text-neutral-400">
            Once you submit your quote, you&apos;ll receive the customer&apos;s contact
            information (name, phone, email) so you can reach out to them directly to discuss
            the project.
          </p>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <h3 className="font-medium text-red-400 mb-2">Tips for a Winning Quote</h3>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>&bull; Be competitive but fair with your pricing</li>
            <li>&bull; Clearly explain what&apos;s included in your quote</li>
            <li>&bull; Highlight your experience with similar projects</li>
            <li>&bull; Respond promptly - customers often choose early responders</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
