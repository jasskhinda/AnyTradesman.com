'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  address: string | null;
  city: string;
  state: string;
  zip_code: string;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface ExistingQuote {
  id: string;
  amount: number;
  message: string;
  estimated_duration: string;
  status: string;
  created_at: string;
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<ServiceRequest | null>(null);
  const [existingQuote, setExistingQuote] = useState<ExistingQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLead() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is a business owner and get their business
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
        .single();

      if (!requestData) {
        router.push('/leads');
        return;
      }

      setLead(requestData);

      // Check if we've already quoted this request
      const { data: quoteData } = await supabase
        .from('quotes')
        .select('*')
        .eq('service_request_id', params.id)
        .eq('business_id', business.id)
        .single();

      if (quoteData) {
        setExistingQuote(quoteData);
      }

      setLoading(false);
    }

    loadLead();
  }, [params.id, router]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/leads" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {lead.categories && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400">
                  {lead.categories.name}
                </span>
              )}
              {existingQuote && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                  <CheckCircle className="w-3 h-3" />
                  You&apos;ve Quoted
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">{lead.title}</h1>
            <p className="text-neutral-400 mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Posted {formatTimeAgo(lead.created_at)}
            </p>
          </div>
          {!existingQuote && (
            <Link href={`/leads/${lead.id}/quote`}>
              <Button size="lg">
                <Send className="w-4 h-4 mr-2" />
                Send Quote
              </Button>
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Description</h4>
                  <p className="text-neutral-200 whitespace-pre-wrap">{lead.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location & Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Location & Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-400">Service Location</p>
                      <p className="text-neutral-200">
                        {lead.city}, {lead.state} {lead.zip_code}
                      </p>
                    </div>
                  </div>

                  {lead.preferred_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Preferred Date</p>
                        <p className="text-neutral-200">
                          {new Date(lead.preferred_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {(lead.budget_min || lead.budget_max) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Customer Budget</p>
                        <p className="text-neutral-200">
                          {lead.budget_min && lead.budget_max
                            ? `$${lead.budget_min} - $${lead.budget_max}`
                            : lead.budget_min
                            ? `From $${lead.budget_min}`
                            : `Up to $${lead.budget_max}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Quote */}
            {existingQuote && (
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Your Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Amount</p>
                      <p className="text-2xl font-bold text-white">${existingQuote.amount}</p>
                    </div>
                    {existingQuote.estimated_duration && (
                      <div>
                        <p className="text-sm text-neutral-400">Estimated Duration</p>
                        <p className="text-neutral-200">{existingQuote.estimated_duration}</p>
                      </div>
                    )}
                  </div>
                  {existingQuote.message && (
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Your Message</p>
                      <p className="text-neutral-200">{existingQuote.message}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-sm text-neutral-400">
                    <Clock className="w-4 h-4" />
                    Sent {formatTimeAgo(existingQuote.created_at)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!existingQuote ? (
                  <Link href={`/leads/${lead.id}/quote`}>
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Quote
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="w-full border-neutral-700 text-neutral-500">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quote Sent
                  </Button>
                )}
                <Link href="/leads">
                  <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Back to All Leads
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Respond quickly to stand out</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Be detailed in your message</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Provide fair, competitive pricing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Highlight your experience</span>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            {lead.status !== 'open' && (
              <Card className="border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-400">Lead No Longer Open</p>
                      <p className="text-sm text-neutral-400 mt-1">
                        This service request is no longer accepting new quotes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
