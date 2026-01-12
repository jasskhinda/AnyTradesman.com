'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetch();
  }, [currentPage, verifiedFilter]);

  async function checkAdminAndFetch() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchBusinesses();
  }

  async function fetchBusinesses() {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' });

    if (verifiedFilter === 'verified') {
      query = query.eq('is_verified', true);
    } else if (verifiedFilter === 'unverified') {
      query = query.eq('is_verified', false);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    if (!error && data) {
      setBusinesses(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  async function handleVerifyBusiness(businessId: string, verify: boolean) {
    const supabase = createClient();

    const { error } = await supabase
      .from('businesses')
      .update({ is_verified: verify })
      .eq('id', businessId);

    if (!error) {
      fetchBusinesses();
    }
    setActionMenuOpen(null);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Admin Header */}
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-red-500">
                AnyTradesman
              </Link>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-neutral-400 hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-neutral-400 hover:text-white">
                Users
              </Link>
              <Link href="/admin/businesses" className="text-white font-medium">
                Businesses
              </Link>
              <Link href="/admin/verifications" className="text-neutral-400 hover:text-white">
                Verifications
              </Link>
              <Link href="/admin/categories" className="text-neutral-400 hover:text-white">
                Categories
              </Link>
              <Link href="/dashboard" className="text-neutral-400 hover:text-white">
                Exit Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Business Management</h1>
          <p className="mt-1 text-neutral-400">View and manage all registered businesses</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Businesses</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
              <Button onClick={() => fetchBusinesses()}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Businesses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Businesses ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-neutral-400">Loading businesses...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                No businesses found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Business</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Rating</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((business) => (
                        <tr key={business.id} className="border-b border-neutral-800 hover:bg-neutral-950">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-white">{business.name}</p>
                              <p className="text-sm text-neutral-400">{business.email || 'No email'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-neutral-400">
                              <MapPin className="w-3 h-3" />
                              {business.city && business.state
                                ? `${business.city}, ${business.state}`
                                : 'Not specified'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-neutral-400">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {business.rating.toFixed(1)} ({business.review_count})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {business.is_verified ? (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 w-fit">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400 w-fit">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(business.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === business.id ? null : business.id)}
                                className="p-2 hover:bg-neutral-700 rounded"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {actionMenuOpen === business.id && (
                                <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10 min-w-[180px]">
                                  <button
                                    onClick={() => router.push(`/admin/businesses/${business.id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-950 text-sm"
                                  >
                                    View Details
                                  </button>
                                  {business.is_verified ? (
                                    <button
                                      onClick={() => handleVerifyBusiness(business.id, false)}
                                      className="w-full text-left px-4 py-2 hover:bg-neutral-950 text-sm text-orange-600"
                                    >
                                      <Clock className="w-4 h-4 inline mr-2" />
                                      Remove Verification
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleVerifyBusiness(business.id, true)}
                                      className="w-full text-left px-4 py-2 hover:bg-neutral-950 text-sm text-green-600"
                                    >
                                      <Shield className="w-4 h-4 inline mr-2" />
                                      Verify Business
                                    </button>
                                  )}
                                  <button
                                    onClick={() => alert('Suspend functionality - requires backend')}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-950 text-sm text-red-500"
                                  >
                                    <Ban className="w-4 h-4 inline mr-2" />
                                    Suspend Business
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-neutral-400">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} businesses
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-neutral-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
