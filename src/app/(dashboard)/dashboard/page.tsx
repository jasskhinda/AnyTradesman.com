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
  AlertCircle,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'business_owner' | 'admin';
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Fetch profile with all fields for header
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If no profile exists, create one
  if (!profileData && !profileError) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      role: user.user_metadata?.role || 'customer',
    });

    if (insertError) {
      console.error('Error creating profile:', insertError);
    }

    // Redirect to refresh the page with new profile
    redirect('/dashboard');
  }

  const profile = profileData as Profile | null;

  if (!profile) {
    // Show error state instead of redirecting to avoid infinite loop
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header initialUser={null} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-800 bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>Unable to load your profile. Please try logging out and back in.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isBusinessOwner = profile.role === 'business_owner';

  // Fetch actual counts with error handling
  let serviceRequestCount = 0;
  let quoteCount = 0;
  const messageCount = 0;

  try {
    if (isBusinessOwner) {
      // For business owners, count leads (open service requests in their area)
      const { count: leadCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      serviceRequestCount = leadCount || 0;
    } else {
      // For customers, count their service requests
      const { count: requestCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id);
      serviceRequestCount = requestCount || 0;

      // Count quotes received on their requests
      const { data: userRequests } = await supabase
        .from('service_requests')
        .select('id')
        .eq('customer_id', user.id);

      if (userRequests && userRequests.length > 0) {
        const requestIds = userRequests.map(r => r.id);
        const { count: quotesReceived } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .in('service_request_id', requestIds);
        quoteCount = quotesReceived || 0;
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Continue with default values
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={profileData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="mt-1 text-neutral-400">
            {isBusinessOwner
              ? 'Manage your business and connect with customers.'
              : 'Find professionals and manage your projects.'}
          </p>
        </div>

        {/* Business Owner Setup Prompt */}
        {isBusinessOwner && (
          <Card className="mb-8 border-yellow-800 bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">Complete Your Business Profile</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Set up your business profile to start receiving leads.
                  </p>
                </div>
                <Link href="/business/setup">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Set Up Business
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isBusinessOwner ? (
            <>
              <Link href="/business">
                <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-red-500/20">
                        <Building2 className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-neutral-400">My Business</p>
                        <p className="text-lg font-semibold text-white">Edit Profile</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/leads">
                <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-500/20">
                        <FileText className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-neutral-400">New Leads</p>
                        <p className="text-lg font-semibold text-white">{serviceRequestCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link href="/search">
                <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-red-500/20">
                        <Search className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-neutral-400">Find Pros</p>
                        <p className="text-lg font-semibold text-white">Search Now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/request">
                <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-500/20">
                        <Plus className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-neutral-400">New Request</p>
                        <p className="text-lg font-semibold text-white">Get Quotes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          <Link href="/messages">
            <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-400">Messages</p>
                    <p className="text-lg font-semibold text-white">{messageCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={isBusinessOwner ? "/my-quotes" : "/my-requests"}>
            <Card className="hover:border-neutral-700 transition-all cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-400">
                      {isBusinessOwner ? 'My Quotes' : 'My Requests'}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {isBusinessOwner ? quoteCount : serviceRequestCount}
                    </p>
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
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>
                  {isBusinessOwner
                    ? 'Your latest leads and quotes'
                    : 'Your recent service requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-neutral-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">
                    {isBusinessOwner
                      ? 'New leads will appear here'
                      : 'Submit a service request to get started'}
                  </p>
                  {!isBusinessOwner && (
                    <Link href="/request" className="inline-block mt-4">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Request
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-neutral-300">Account Settings</span>
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </Link>
                {isBusinessOwner && (
                  <>
                    <Link
                      href="/business/credentials"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-neutral-300">Manage Credentials</span>
                      <ArrowRight className="w-4 h-4 text-neutral-500" />
                    </Link>
                    <Link
                      href="/business/subscription"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-neutral-300">Subscription</span>
                      <ArrowRight className="w-4 h-4 text-neutral-500" />
                    </Link>
                  </>
                )}
                <Link
                  href="/help"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-neutral-300">Help & Support</span>
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </Link>
              </CardContent>
            </Card>

            {/* Upgrade CTA for free tier */}
            {isBusinessOwner && (
              <Card className="mt-6 bg-gradient-to-br from-red-600 to-red-700 text-white border-0">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                  <p className="mt-2 text-red-100 text-sm">
                    Get more leads, priority placement, and advanced analytics.
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-4 bg-white text-red-600 hover:bg-neutral-100 w-full">
                      View Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
