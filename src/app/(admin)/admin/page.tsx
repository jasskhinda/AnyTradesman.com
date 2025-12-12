import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Building2,
  FileCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

interface Profile {
  id: string;
  role: 'customer' | 'business_owner' | 'admin';
}

interface Stats {
  totalUsers: number;
  totalBusinesses: number;
  pendingVerifications: number;
  activeSubscriptions: number;
  newUsersToday: number;
  newBusinessesToday: number;
}

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>): Promise<Stats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: totalBusinesses },
    { count: pendingVerifications },
    { count: activeSubscriptions },
    { count: newUsersToday },
    { count: newBusinessesToday },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('business_credentials').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
  ]);

  return {
    totalUsers: totalUsers || 0,
    totalBusinesses: totalBusinesses || 0,
    pendingVerifications: pendingVerifications || 0,
    activeSubscriptions: activeSubscriptions || 0,
    newUsersToday: newUsersToday || 0,
    newBusinessesToday: newBusinessesToday || 0,
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const stats = await getStats(supabase);

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('id, name, is_verified, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

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
              <Link href="/admin" className="text-white font-medium">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-neutral-400 hover:text-white">
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
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-neutral-400">Overview of platform activity and metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm text-green-400 mt-1">+{stats.newUsersToday} today</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Businesses</p>
                  <p className="text-3xl font-bold text-white">{stats.totalBusinesses}</p>
                  <p className="text-sm text-green-400 mt-1">+{stats.newBusinessesToday} today</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Pending Verifications</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingVerifications}</p>
                  {stats.pendingVerifications > 0 && (
                    <p className="text-sm text-orange-400 mt-1">Needs attention</p>
                  )}
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <FileCheck className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-white">{stats.activeSubscriptions}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/users">
            <Card className="hover:border-neutral-700 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <Users className="w-8 h-8 text-red-400" />
                <div>
                  <p className="font-medium text-white">Manage Users</p>
                  <p className="text-sm text-neutral-400">View, edit, suspend</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/businesses">
            <Card className="hover:border-neutral-700 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <Building2 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="font-medium text-white">Manage Businesses</p>
                  <p className="text-sm text-neutral-400">Review, verify</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/verifications">
            <Card className="hover:border-neutral-700 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <FileCheck className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="font-medium text-white">Verifications</p>
                  <p className="text-sm text-neutral-400">{stats.pendingVerifications} pending</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/categories">
            <Card className="hover:border-neutral-700 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <LayoutGrid className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Categories</p>
                  <p className="text-sm text-neutral-400">Manage services</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </div>
                <Link href="/admin/users" className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{user.full_name || 'Unnamed'}</p>
                        <p className="text-sm text-neutral-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.role === 'business_owner'
                            ? 'bg-green-500/20 text-green-400'
                            : user.role === 'admin'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 text-center py-4">No users yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Businesses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Businesses</CardTitle>
                  <CardDescription>Latest business registrations</CardDescription>
                </div>
                <Link href="/admin/businesses" className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentBusinesses && recentBusinesses.length > 0 ? (
                <div className="space-y-4">
                  {recentBusinesses.map((business) => (
                    <div key={business.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{business.name}</p>
                        <p className="text-sm text-neutral-400">
                          {new Date(business.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {business.is_verified ? (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 text-center py-4">No businesses yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
