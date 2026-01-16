'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Profile } from '@/types/database';

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
  in_progress: { label: 'In Progress', color: 'text-red-400 bg-red-500/20', icon: Clock },
  completed: { label: 'Completed', color: 'text-neutral-400 bg-neutral-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/20', icon: XCircle },
};

interface MyRequestsViewProps {
  userProfile: Profile | null;
  initialRequests: ServiceRequest[];
}

export function MyRequestsView({
  userProfile,
  initialRequests,
}: MyRequestsViewProps) {
  const [requests] = useState<ServiceRequest[]>(initialRequests);
  const [filter, setFilter] = useState<string>('all');

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={userProfile} />

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
                  ? 'bg-red-600 text-white'
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
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-sm">
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
