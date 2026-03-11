import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
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
  status: string;
  created_at: string;
  preferred_date: string | null;
  categories: { name: string } | null;
  profiles: { full_name: string | null; email: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  matched: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-indigo-500/20 text-indigo-400',
  completed: 'bg-green-500/20 text-green-400',
  canceled: 'bg-red-500/20 text-red-400',
};

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return '-';
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return `Up to $${max!.toLocaleString()}`;
}

export default async function AdminRequestsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const { data: requests } = await supabase
    .from('service_requests')
    .select(`
      id, title, description, city, state, zip_code,
      budget_min, budget_max, status, created_at, preferred_date,
      categories(name),
      profiles!service_requests_customer_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-neutral-950">
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
              <Link href="/admin/businesses" className="text-neutral-400 hover:text-white">
                Businesses
              </Link>
              <Link href="/admin/requests" className="text-white font-medium">
                Requests
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
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Service Requests</h1>
          <p className="mt-1 text-neutral-400">All customer service requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Requests ({requests?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests && requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Budget</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const customer = req.profiles as unknown as { full_name: string | null; email: string } | null;
                      const category = req.categories as unknown as { name: string } | null;
                      return (
                        <tr key={req.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-white truncate max-w-[250px]">{req.title}</p>
                              {category && (
                                <p className="text-xs text-neutral-500">{category.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-white">{customer?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-neutral-500">{customer?.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-neutral-300 text-sm">
                              <MapPin className="w-3 h-3" />
                              {req.city}, {req.state}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-300 text-sm">
                            {formatBudget(req.budget_min, req.budget_max)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded ${STATUS_STYLES[req.status] || 'bg-neutral-800 text-neutral-300'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400 text-center py-8">No service requests yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
