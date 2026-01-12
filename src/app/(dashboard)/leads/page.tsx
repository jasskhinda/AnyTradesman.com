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
  Calendar,
  ArrowRight,
  FileText,
  AlertCircle,
  Send,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  zip_code: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  categories?: {
    id: string;
    name: string;
  };
  has_quoted?: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ServiceRequest[]>([]);
  const [myCategories, setMyCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeads() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is a business owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'business_owner') {
        router.push('/dashboard');
        return;
      }

      // Get the business for this user
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (business) {
        setBusinessId(business.id);

        // Get categories this business serves
        const { data: businessCategories } = await supabase
          .from('business_categories')
          .select('categories (id, name)')
          .eq('business_id', business.id);

        if (businessCategories) {
          const categories = businessCategories
            .map((bc: { categories: Category | Category[] | null }) => {
              if (Array.isArray(bc.categories)) {
                return bc.categories[0] || null;
              }
              return bc.categories;
            })
            .filter((c: Category | null): c is Category => c !== null);
          setMyCategories(categories);
        }
      }

      // Load open service requests
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      const { data: requestsData } = await query;

      if (requestsData && business) {
        // Check which requests we've already quoted
        const requestIds = requestsData.map((r: ServiceRequest) => r.id);
        const { data: existingQuotes } = await supabase
          .from('quotes')
          .select('service_request_id')
          .eq('business_id', business.id)
          .in('service_request_id', requestIds);

        const quotedRequestIds = new Set(existingQuotes?.map((q: { service_request_id: string }) => q.service_request_id) || []);

        const leadsWithQuoteStatus = requestsData.map((request: ServiceRequest) => ({
          ...request,
          has_quoted: quotedRequestIds.has(request.id),
        }));

        setLeads(leadsWithQuoteStatus);
      }

      setLoading(false);
    }

    loadLeads();
  }, [router]);

  const filteredLeads = selectedCategory === 'all'
    ? leads
    : leads.filter((lead) => lead.categories?.id === selectedCategory);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/4" />
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-neutral-800 rounded-lg" />
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Available Leads</h1>
            <p className="text-neutral-400 mt-1">
              Service requests from customers in your area
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {myCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{leads.length}</p>
                <p className="text-sm text-neutral-400 mt-1">Total Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {leads.filter((l) => !l.has_quoted).length}
                </p>
                <p className="text-sm text-neutral-400 mt-1">New Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">
                  {leads.filter((l) => l.has_quoted).length}
                </p>
                <p className="text-sm text-neutral-400 mt-1">Quoted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              <h3 className="text-lg font-medium text-white mb-2">No leads available</h3>
              <p className="text-neutral-400">
                {selectedCategory !== 'all'
                  ? 'No leads in this category right now. Try selecting a different category.'
                  : 'There are no open service requests at the moment. Check back soon!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredLeads.map((lead) => (
              <Card
                key={lead.id}
                className={`hover:border-neutral-700 transition-colors ${
                  lead.has_quoted ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {lead.has_quoted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            <CheckCircle className="w-3 h-3" />
                            Quoted
                          </span>
                        )}
                        {lead.categories && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400">
                            {lead.categories.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-white truncate">{lead.title}</h3>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                      {formatTimeAgo(lead.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
                    {lead.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {lead.city}, {lead.state}
                    </span>
                    {(lead.budget_min || lead.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {lead.budget_min && lead.budget_max
                          ? `$${lead.budget_min} - $${lead.budget_max}`
                          : lead.budget_min
                          ? `From $${lead.budget_min}`
                          : `Up to $${lead.budget_max}`}
                      </span>
                    )}
                    {lead.preferred_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.preferred_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                    <Link href={`/leads/${lead.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    {!lead.has_quoted && (
                      <Link href={`/leads/${lead.id}/quote`}>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          Send Quote
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
