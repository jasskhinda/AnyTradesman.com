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
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Quote {
  id: string;
  amount: number;
  message: string;
  estimated_duration: string;
  status: string;
  created_at: string;
  businesses: {
    id: string;
    name: string;
    rating_average: number;
    rating_count: number;
    is_verified: boolean;
  };
}

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

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: 'Open', color: 'text-green-400 bg-green-500/20', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'text-red-400 bg-red-500/20', icon: Clock },
  completed: { label: 'Completed', color: 'text-neutral-400 bg-neutral-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/20', icon: XCircle },
};

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequestAndQuotes() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load service request
      const { data: requestData } = await supabase
        .from('service_requests')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', params.id)
        .eq('customer_id', user.id)
        .single();

      if (!requestData) {
        router.push('/dashboard');
        return;
      }

      setRequest(requestData);

      // Load quotes for this request
      const { data: quotesData } = await supabase
        .from('quotes')
        .select(`
          *,
          businesses (
            id,
            name,
            rating_average,
            rating_count,
            is_verified
          )
        `)
        .eq('service_request_id', params.id)
        .order('created_at', { ascending: false });

      if (quotesData) {
        setQuotes(quotesData);
      }

      setLoading(false);
    }

    loadRequestAndQuotes();
  }, [params.id, router]);

  async function handleCancelRequest() {
    if (!request) return;
    if (!confirm('Are you sure you want to cancel this request?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'cancelled' })
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, status: 'cancelled' });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="h-64 bg-neutral-800 rounded" />
            <div className="h-48 bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const status = statusConfig[request.status] || statusConfig.open;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Request Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{request.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              {request.categories && (
                <span className="text-neutral-400">{request.categories.name}</span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>
          {request.status === 'open' && (
            <Button
              variant="outline"
              onClick={handleCancelRequest}
              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              Cancel Request
            </Button>
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
                  <h4 className="text-sm font-medium text-neutral-400 mb-1">Description</h4>
                  <p className="text-neutral-200 whitespace-pre-wrap">{request.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-400">Location</p>
                      <p className="text-neutral-200">
                        {request.address && `${request.address}, `}
                        {request.city}, {request.state} {request.zip_code}
                      </p>
                    </div>
                  </div>

                  {request.preferred_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Preferred Date</p>
                        <p className="text-neutral-200">
                          {new Date(request.preferred_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {(request.budget_min || request.budget_max) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Budget Range</p>
                        <p className="text-neutral-200">
                          {request.budget_min && request.budget_max
                            ? `$${request.budget_min} - $${request.budget_max}`
                            : request.budget_min
                            ? `From $${request.budget_min}`
                            : `Up to $${request.budget_max}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-400">Posted</p>
                      <p className="text-neutral-200">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Quotes Received
                  {quotes.length > 0 && (
                    <span className="text-sm font-normal px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      {quotes.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                    <p className="text-neutral-400">No quotes yet</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Professionals are being notified. Quotes will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{quote.businesses.name}</h4>
                              {quote.businesses.is_verified && (
                                <CheckCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span>{quote.businesses.rating_average?.toFixed(1) || 'New'}</span>
                              <span>({quote.businesses.rating_count || 0} reviews)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">${quote.amount}</p>
                            {quote.estimated_duration && (
                              <p className="text-sm text-neutral-400">{quote.estimated_duration}</p>
                            )}
                          </div>
                        </div>

                        {quote.message && (
                          <p className="text-neutral-300 text-sm mb-4">{quote.message}</p>
                        )}

                        <div className="flex items-center gap-3">
                          <Link href={`/business/${quote.businesses.id}`}>
                            <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/messages?business=${quote.businesses.id}`}>
                            <Button size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400 space-y-3">
                <p>
                  If you have questions about your request or received quotes, our support team is here to help.
                </p>
                <Link href="/help">
                  <Button variant="outline" size="sm" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Tips for Choosing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Compare multiple quotes before deciding</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Check reviews and verification status</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ask questions via messaging</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Confirm details before hiring</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
