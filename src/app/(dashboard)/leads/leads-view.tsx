'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
  AlertCircle,
  Send,
  CheckCircle,
  Search,
  Lock,
  Crown,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Profile } from '@/types/database';
import type { LeadRow } from './page';

interface Category {
  id: string;
  name: string;
}

interface LeadsViewProps {
  userProfile: Profile | null;
  leads: LeadRow[];
  myCategories: Category[];
  hasActiveSubscription: boolean;
  hasCategories: boolean;
  businessArea: string;
  tab: 'available' | 'quoted';
  search: string;
  categoryFilter: string;
  areaFilter: 'mine' | 'all';
  page: number;
  pageSize: number;
  totalCount: number;
  quotedCount: number;
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function budgetLabel(min: number | null, max: number | null) {
  if (min && max) return `$${min} - $${max}`;
  if (min) return `From $${min}`;
  if (max) return `Up to $${max}`;
  return 'Budget flexible';
}

export function LeadsView({
  userProfile,
  leads,
  myCategories,
  hasActiveSubscription,
  hasCategories,
  businessArea,
  tab,
  search,
  categoryFilter,
  areaFilter,
  page,
  pageSize,
  totalCount,
  quotedCount,
}: LeadsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function updateParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    // any filter change resets paging
    if (!('page' in changes)) next.delete('page');
    router.push(`/leads?${next.toString()}`);
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={userProfile} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="mt-1 text-neutral-400">
            {hasCategories ? (
              <>
                Jobs matching your services
                {areaFilter === 'mine' && businessArea ? ` in ${businessArea}` : ' everywhere'}
              </>
            ) : (
              'Add the services you offer to start receiving leads'
            )}
          </p>
        </div>

        {/* Subscription banner */}
        {!hasActiveSubscription && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Subscribe to send quotes</p>
                <p className="text-sm text-neutral-400">
                  You can browse matching leads, but sending a quote and seeing customer
                  contact details require an active plan.
                </p>
              </div>
            </div>
            <Link href="/business/subscription">
              <Button className="whitespace-nowrap">
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </Link>
          </div>
        )}

        {/* No categories -> nothing can match */}
        {!hasCategories ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              <p className="text-white font-medium">No services selected</p>
              <p className="text-sm text-neutral-400 mt-1 mb-6">
                We match leads to the trades you offer. Add your services to start
                seeing jobs.
              </p>
              <Link href="/business">
                <Button>Add your services</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => updateParams({ tab: null })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'available'
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => updateParams({ tab: 'quoted' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'quoted'
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Quoted ({quotedCount})
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form
                className="relative flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateParams({ q: searchInput.trim() || null });
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </form>

              <select
                value={categoryFilter}
                onChange={(e) => updateParams({ category: e.target.value || null })}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All my services</option>
                {myCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={areaFilter}
                onChange={(e) => updateParams({ area: e.target.value === 'all' ? 'all' : null })}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="mine">My service area</option>
                <option value="all">All areas</option>
              </select>
            </div>

            {/* Results */}
            {leads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                  <p className="text-white font-medium">
                    {tab === 'quoted' ? 'No quotes sent yet' : 'No matching leads right now'}
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {tab === 'quoted'
                      ? 'Quotes you send will appear here so you can track them.'
                      : areaFilter === 'mine'
                      ? 'Try widening to All areas, or check back soon — new jobs arrive daily.'
                      : 'New jobs in your trades will show up here as customers post them.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-neutral-500 mb-3">
                  {totalCount} {totalCount === 1 ? 'lead' : 'leads'}
                </p>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <Card key={lead.id} className={lead.has_quoted ? 'opacity-80' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white">{lead.title}</h3>
                              {lead.is_new && !lead.has_quoted && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                                  New
                                </span>
                              )}
                              {lead.is_local && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                  <Sparkles className="w-3 h-3" />
                                  Local
                                </span>
                              )}
                              {lead.has_quoted && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-500/20 text-neutral-300">
                                  <CheckCircle className="w-3 h-3" />
                                  Quoted
                                </span>
                              )}
                            </div>

                            {lead.categories && (
                              <p className="text-sm text-neutral-400 mb-2">{lead.categories.name}</p>
                            )}

                            <p className="text-neutral-300 text-sm line-clamp-2 mb-3">
                              {lead.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {lead.city}, {lead.state}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {budgetLabel(lead.budget_min, lead.budget_max)}
                              </span>
                              {lead.preferred_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(lead.preferred_date).toLocaleDateString()}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {lead.quote_count === 0
                                  ? 'Be the first to quote'
                                  : `${lead.quote_count} ${lead.quote_count === 1 ? 'quote' : 'quotes'} sent`}
                              </span>
                              <span>{timeAgo(lead.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 sm:w-40">
                            <Link href={`/leads/${lead.id}`} className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                              >
                                View
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                            {!lead.has_quoted &&
                              (hasActiveSubscription ? (
                                <Link href={`/leads/${lead.id}/quote`} className="flex-1">
                                  <Button className="w-full">
                                    <Send className="w-4 h-4 mr-2" />
                                    Quote
                                  </Button>
                                </Link>
                              ) : (
                                <Link href="/business/subscription" className="flex-1">
                                  <Button variant="outline" className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Subscribe
                                  </Button>
                                </Link>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
                    <p className="text-sm text-neutral-500">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => updateParams({ page: String(page - 1) })}
                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => updateParams({ page: String(page + 1) })}
                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
