'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  MoreVertical,
  Ban,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'business_owner' | 'admin';
  phone: string | null;
  created_at: string;
  is_suspended?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetch();
  }, [currentPage, roleFilter]);

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

    fetchUsers();
  }

  async function fetchUsers() {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    if (!error && data) {
      setUsers(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  async function handleSuspendUser(userId: string, suspend: boolean) {
    alert(`User ${suspend ? 'suspended' : 'unsuspended'} (demo - requires backend implementation)`);
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
              <Link href="/admin/users" className="text-white font-medium">
                Users
              </Link>
              <Link href="/admin/businesses" className="text-neutral-400 hover:text-white">
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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-neutral-400">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-neutral-700 bg-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="business_owner">Business Owners</option>
                <option value="admin">Admins</option>
              </select>
              <Button onClick={() => fetchUsers()}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              Users ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-neutral-400">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                No users found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">User</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-neutral-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-white">{user.full_name || 'Unnamed'}</p>
                              <p className="text-sm text-neutral-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded ${
                              user.role === 'business_owner'
                                ? 'bg-green-500/20 text-green-400'
                                : user.role === 'admin'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}>
                              {user.role === 'business_owner' ? 'Business' : user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            {user.phone || '-'}
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                                className="p-2 hover:bg-neutral-700 rounded"
                              >
                                <MoreVertical className="w-4 h-4 text-neutral-400" />
                              </button>
                              {actionMenuOpen === user.id && (
                                <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                                  <button
                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-neutral-300"
                                  >
                                    View Details
                                  </button>
                                  {user.role !== 'admin' && (
                                    <button
                                      onClick={() => handleSuspendUser(user.id, true)}
                                      className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-sm text-red-400"
                                    >
                                      <Ban className="w-4 h-4 inline mr-2" />
                                      Suspend User
                                    </button>
                                  )}
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
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
                    <p className="text-sm text-neutral-400">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} users
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
