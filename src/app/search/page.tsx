import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Find a Pro',
  description: 'Search for trusted local contractors, plumbers, electricians, and more in your area. Read reviews and get free quotes.',
};
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/ui/search-bar';
import { BusinessCard } from '@/components/ui/business-card';
import { createClient } from '@/lib/supabase/server';
import { MapPin } from 'lucide-react';

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
  const { q } = searchParams;

  try {
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
        ),
        subscriptions (
          tier,
          status,
          current_period_end
        )
      `)
      .eq('is_active', true)
      .limit(40);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data: businesses, error } = await query;

    if (error) {
      // If table doesn't exist or RLS blocks, show no results instead of error
      console.error('Search error:', error);
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No professionals yet</h3>
          <p className="text-neutral-400 max-w-md mx-auto">
            Be the first to join our network of trusted professionals.
          </p>
        </div>
      );
    }

    // Transform the data to include categories and subscription status
    const transformedBusinesses = (businesses?.map((business) => {
      const sub = Array.isArray(business.subscriptions)
        ? business.subscriptions[0]
        : business.subscriptions;
      const isActiveSubscriber = sub?.status === 'active' &&
        sub?.current_period_end &&
        new Date(sub.current_period_end) > new Date();
      const isFeatured = isActiveSubscriber && sub?.tier === 'enterprise';

      return {
        ...business,
        categories: business.business_categories?.map((bc: { categories: { name: string; slug: string } }) => bc.categories) || [],
        isSubscriber: !!isActiveSubscriber,
        isFeatured: !!isFeatured,
      };
    }) || []).sort((a, b) => {
      // Featured first, then subscribers, then by rating
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.isSubscriber && !b.isSubscriber) return -1;
      if (!a.isSubscriber && b.isSubscriber) return 1;
      return (b.rating_average || 0) - (a.rating_average || 0);
    }).slice(0, 20);

    if (transformedBusinesses.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-neutral-400 max-w-md mx-auto">
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
  } catch (err) {
    console.error('Search error:', err);
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No professionals yet</h3>
        <p className="text-neutral-400 max-w-md mx-auto">
          Be the first to join our network of trusted professionals.
        </p>
      </div>
    );
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, location, category } = resolvedSearchParams;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <SearchBar showButton={true} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {q ? `Results for "${q}"` : category ? `${category} Services` : 'All Professionals'}
              </h1>
              {location && (
                <p className="mt-1 text-neutral-400 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Near {location}
                </p>
              )}
            </div>

          </div>

          {/* Results Grid */}
          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden animate-pulse">
                    <div className="h-40 bg-neutral-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800 rounded w-1/2" />
                      <div className="h-3 bg-neutral-800 rounded w-2/3" />
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
