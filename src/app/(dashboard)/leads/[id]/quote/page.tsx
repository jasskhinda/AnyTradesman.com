'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  DollarSign,
  Send,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  budget_min: number | null;
  budget_max: number | null;
  categories?: {
    name: string;
  };
}

export default function SendQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    estimated_duration: '',
  });

  useEffect(() => {
    async function loadLead() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get the business for this user
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) {
        router.push('/dashboard');
        return;
      }

      setBusinessId(business.id);

      // Check if we've already quoted this request
      const { data: existingQuote } = await supabase
        .from('quotes')
        .select('id')
        .eq('service_request_id', params.id)
        .eq('business_id', business.id)
        .single();

      if (existingQuote) {
        router.push(`/leads/${params.id}`);
        return;
      }

      // Load the service request
      const { data: requestData } = await supabase
        .from('service_requests')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', params.id)
        .eq('status', 'open')
        .single();

      if (!requestData) {
        router.push('/leads');
        return;
      }

      setLead(requestData);
      setLoading(false);
    }

    loadLead();
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !lead) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid quote amount');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from('quotes')
      .insert({
        service_request_id: lead.id,
        business_id: businessId,
        amount: amount,
        message: formData.message || null,
        estimated_duration: formData.estimated_duration || null,
        status: 'pending',
      });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Redirect to lead page with success state
    router.push(`/leads/${lead.id}?quoted=true`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="h-64 bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href={`/leads/${lead.id}`} className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lead Details
        </Link>

        {/* Lead Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                {lead.categories && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400 mb-2">
                    {lead.categories.name}
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

        {/* Quote Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Send Your Quote</CardTitle>
            <CardDescription>
              Provide your best price and details to win this job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Quote Amount */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Quote Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-10 pr-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Enter your total price for completing this job
                </p>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Estimated Duration (optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                    placeholder="e.g., 2-3 hours, 1 day, 1 week"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Message to Customer (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Introduce yourself and explain why you're the best fit for this job. Include:
• Your relevant experience
• What's included in your quote
• Your availability
• Any questions you have"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
                <Link href={`/leads/${lead.id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Quote
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <h3 className="font-medium text-red-400 mb-2">Tips for a Winning Quote</h3>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• Be competitive but fair with your pricing</li>
            <li>• Clearly explain what&apos;s included in your quote</li>
            <li>• Highlight your experience with similar projects</li>
            <li>• Respond promptly - customers often choose early responders</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
