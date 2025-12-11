import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/ui/search-bar';
import { BusinessCard } from '@/components/ui/business-card';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    radius?: string;
  }>;
}

async function SearchResults({ searchParams }: { searchParams: Awaited<SearchPageProps['searchParams']> }) {
  const supabase = await createClient();
  const { q, location, category, radius } = searchParams;

  // For now, just fetch all active businesses
  // In production, you'd use the PostGIS functions for location-based search
  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories (
        categories (
          name,
          slug
        )
      )
    `)
    .eq('is_active', true)
    .order('rating_average', { ascending: false })
    .limit(20);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: businesses, error } = await query;

  if (error) {
    console.error('Search error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">An error occurred while searching. Please try again.</p>
      </div>
    );
  }

  // Transform the data to include categories
  const transformedBusinesses = businesses?.map((business) => ({
    ...business,
    categories: business.business_categories?.map((bc: { categories: { name: string; slug: string } }) => bc.categories) || [],
  })) || [];

  if (transformedBusinesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn&apos;t find any professionals matching your search. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transformedBusinesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, location, category } = resolvedSearchParams;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <SearchBar showButton={true} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {q ? `Results for "${q}"` : category ? `${category} Services` : 'All Professionals'}
              </h1>
              {location && (
                <p className="mt-1 text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Near {location}
                </p>
              )}
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <SearchResults searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
