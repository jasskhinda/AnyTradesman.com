import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageSquare,
  Star,
  Building2,
  Search,
  Plus,
  ArrowRight,
  Bell,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'business_owner' | 'admin';
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile with explicit type
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile) {
    redirect('/login');
  }

  const isBusinessOwner = profile.role === 'business_owner';

  // For now, show placeholder counts - these will be populated when the database is set up
  const serviceRequestCount = 0;
  const quoteCount = 0;
  const messageCount = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="mt-1 text-gray-500">
            {isBusinessOwner
              ? 'Manage your business and connect with customers.'
              : 'Find professionals and manage your projects.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isBusinessOwner ? (
            <>
              <Link href="/business">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">My Business</p>
                        <p className="text-lg font-semibold text-gray-900">Edit Profile</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/quotes">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-100">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">New Leads</p>
                        <p className="text-lg font-semibold text-gray-900">{serviceRequestCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link href="/search">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Search className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Find Pros</p>
                        <p className="text-lg font-semibold text-gray-900">Search Now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/request">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Plus className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">New Request</p>
                        <p className="text-lg font-semibold text-gray-900">Get Quotes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          <Link href="/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Messages</p>
                    <p className="text-lg font-semibold text-gray-900">{messageCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quotes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Quotes</p>
                    <p className="text-lg font-semibold text-gray-900">{quoteCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  {isBusinessOwner
                    ? 'Your latest leads and quotes'
                    : 'Your recent service requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">
                    {isBusinessOwner
                      ? 'New leads will appear here'
                      : 'Submit a service request to get started'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Account Settings</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
                {isBusinessOwner && (
                  <>
                    <Link
                      href="/business/credentials"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">Manage Credentials</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    <Link
                      href="/business/subscription"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">Subscription</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </>
                )}
                <Link
                  href="/help"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Help & Support</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </CardContent>
            </Card>

            {/* Upgrade CTA for free tier */}
            {isBusinessOwner && (
              <Card className="mt-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                  <p className="mt-2 text-blue-100 text-sm">
                    Get more leads, priority placement, and advanced analytics.
                  </p>
                  <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100 w-full">
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
