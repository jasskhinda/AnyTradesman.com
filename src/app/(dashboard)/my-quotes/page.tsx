'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  HourglassIcon,
  FileText,
} from 'lucide-react';

interface Quote {
  id: string;
  amount: number;
  message: string;
  estimated_duration: string;
  status: string;
  created_at: string;
  service_requests: {
    id: string;
    title: string;
    city: string;
    state: string;
    status: string;
    categories?: {
      name: string;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/20', icon: HourglassIcon },
  accepted: { label: 'Accepted', color: 'text-green-400 bg-green-500/20', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'text-red-400 bg-red-500/20', icon: XCircle },
};

export default function MyQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadQuotes() {
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

      // Load quotes for this business
      const { data: quotesData } = await supabase
        .from('quotes')
        .select(`
          *,
          service_requests (
            id,
            title,
            city,
            state,
            status,
            categories (
              name
            )
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (quotesData) {
        setQuotes(quotesData);
      }

      setLoading(false);
    }

    loadQuotes();
  }, [router]);

  const filteredQuotes = filter === 'all'
    ? quotes
    : quotes.filter((q) => q.status === filter);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-800 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Quotes</h1>
            <p className="text-neutral-400 mt-1">Track all quotes you&apos;ve sent to customers</p>
          </div>
          <Link href="/leads">
            <Button>
              View Available Leads
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{quotes.length}</p>
                <p className="text-xs text-neutral-400">Total Sent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {quotes.filter((q) => q.status === 'pending').length}
                </p>
                <p className="text-xs text-neutral-400">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {quotes.filter((q) => q.status === 'accepted').length}
                </p>
                <p className="text-xs text-neutral-400">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {quotes.filter((q) => q.status === 'rejected').length}
                </p>
                <p className="text-xs text-neutral-400">Declined</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              {quotes.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No quotes sent yet</h3>
                  <p className="text-neutral-400 mb-6">
                    Browse available leads and start sending quotes to win new customers.
                  </p>
                  <Link href="/leads">
                    <Button>
                      View Available Leads
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No {filter} quotes</h3>
                  <p className="text-neutral-400">
                    You don&apos;t have any quotes with this status.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const status = statusConfig[quote.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={quote.id} className="hover:border-neutral-700 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white truncate">
                            {quote.service_requests.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                          {quote.service_requests.categories && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {quote.service_requests.categories.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {quote.service_requests.city}, {quote.service_requests.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(quote.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">${quote.amount}</p>
                          {quote.estimated_duration && (
                            <p className="text-xs text-neutral-500">{quote.estimated_duration}</p>
                          )}
                        </div>
                        <Link href={`/leads/${quote.service_requests.id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {quote.message && (
                      <p className="mt-3 pt-3 border-t border-neutral-800 text-sm text-neutral-400 line-clamp-2">
                        {quote.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
