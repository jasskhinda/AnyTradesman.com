'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  categories?: {
    name: string;
  };
  quote_count?: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: 'Open', color: 'text-green-400 bg-green-500/20', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-500/20', icon: Clock },
  completed: { label: 'Completed', color: 'text-neutral-400 bg-neutral-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/20', icon: XCircle },
};

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadRequests() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load service requests with quote counts
      const { data: requestsData } = await supabase
        .from('service_requests')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsData) {
        // Get quote counts for each request
        const requestsWithCounts = await Promise.all(
          requestsData.map(async (request) => {
            const { count } = await supabase
              .from('quotes')
              .select('*', { count: 'exact', head: true })
              .eq('service_request_id', request.id);

            return {
              ...request,
              quote_count: count || 0,
            };
          })
        );

        setRequests(requestsWithCounts);
      }

      setLoading(false);
    }

    loadRequests();
  }, [router]);

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
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
            <h1 className="text-2xl font-bold text-white">My Service Requests</h1>
            <p className="text-neutral-400 mt-1">Track your projects and received quotes</p>
          </div>
          <Link href="/request">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'open', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              {requests.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No service requests yet</h3>
                  <p className="text-neutral-400 mb-6">
                    Create your first request to get quotes from local professionals.
                  </p>
                  <Link href="/request">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No {filter.replace('_', ' ')} requests</h3>
                  <p className="text-neutral-400">
                    You don&apos;t have any requests with this status.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.open;
              const StatusIcon = status.icon;

              return (
                <Link key={request.id} href={`/request/${request.id}`}>
                  <Card className="hover:border-neutral-700 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white truncate">{request.title}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                            {request.categories && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {request.categories.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {request.city}, {request.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          {request.quote_count !== undefined && request.quote_count > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>{request.quote_count} quote{request.quote_count !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <ArrowRight className="w-5 h-5 text-neutral-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
