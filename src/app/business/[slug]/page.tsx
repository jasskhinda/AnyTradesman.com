import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types/database';

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BusinessPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, city, state')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!business) {
    return {
      title: 'Business Not Found | AnyTrades',
    };
  }

  return {
    title: `${business.name} | AnyTrades`,
    description: business.description || `${business.name} - Professional services in ${business.city}, ${business.state}`,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user for header
  const { data: { user } } = await supabase.auth.getUser();
  let userProfile: Profile | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  // Fetch business by slug
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !business) {
    notFound();
  }

  // Fetch categories for this business
  const { data: businessCategories } = await supabase
    .from('business_categories')
    .select(`
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('business_id', business.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = businessCategories?.map((bc: any) => bc.categories).filter(Boolean).flat() || [];

  // Fetch reviews for this business
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:customer_id (
        full_name,
        avatar_url
      )
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header initialUser={userProfile} />

      <main className="flex-1">
        {/* Hero Section with Cover Image */}
        <div className="relative h-64 md:h-80 bg-neutral-900">
          {business.cover_image_url ? (
            <Image
              src={business.cover_image_url}
              alt={business.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Business Info Section */}
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                  {business.logo_url ? (
                    <Image
                      src={business.logo_url}
                      alt={`${business.name} logo`}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-4xl font-bold">
                      {business.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {business.name}
                      </h1>
                      {business.is_verified && (
                        <span className="inline-flex items-center bg-green-500/20 text-green-400 text-sm font-medium px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(business.rating_average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-medium text-white">
                        {(business.rating_average || 0).toFixed(1)}
                      </span>
                      <span className="ml-2 text-neutral-400">
                        ({business.rating_count || 0} reviews)
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center mt-2 text-neutral-400">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>
                        {business.city}, {business.state}
                        {business.service_radius_miles && (
                          <span className="ml-2 text-neutral-500">
                            (Serves within {business.service_radius_miles} miles)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/request?business=${business.id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Quote
                      </Button>
                    </Link>
                    {business.phone && (
                      <a href={`tel:${business.phone}`}>
                        <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/search?category=${category.slug}`}
                        className="text-sm bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full hover:bg-neutral-700 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description & Reviews */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                {business.description ? (
                  <p className="text-neutral-300 whitespace-pre-line">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-neutral-500 italic">
                    No description provided yet.
                  </p>
                )}
              </section>

              {/* Reviews Section */}
              <section className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Reviews ({business.rating_count || 0})
                  </h2>
                </div>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-neutral-800 last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-medium">
                            {review.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">
                                {review.profiles?.full_name || 'Anonymous'}
                              </span>
                              <span className="text-sm text-neutral-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-neutral-600'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.title && (
                              <h4 className="font-medium text-white mt-2">
                                {review.title}
                              </h4>
                            )}
                            {review.comment && (
                              <p className="text-neutral-400 mt-2">
                                {review.comment}
                              </p>
                            )}
                            {review.is_verified && (
                              <span className="inline-flex items-center text-xs text-green-400 mt-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-8">
                    No reviews yet. Be the first to leave a review!
                  </p>
                )}
              </section>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-3 text-red-500" />
                      {business.phone}
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5 mr-3 text-red-500" />
                      {business.email}
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5 mr-3 text-red-500" />
                      Visit Website
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-start text-neutral-300">
                      <MapPin className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>
                        {business.address}
                        <br />
                        {business.city}, {business.state} {business.zip_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Hours (placeholder - can be extended) */}
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Business Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-neutral-300">
                    <Clock className="w-5 h-5 mr-3 text-red-500" />
                    <span>Contact for hours</span>
                  </div>
                  <div className="flex items-center text-neutral-300">
                    <Shield className="w-5 h-5 mr-3 text-red-500" />
                    <span>
                      {business.is_verified ? 'Verified Business' : 'Pending Verification'}
                    </span>
                  </div>
                  <div className="flex items-center text-neutral-300">
                    <MapPin className="w-5 h-5 mr-3 text-red-500" />
                    <span>Serves {business.service_radius_miles} mile radius</span>
                  </div>
                </div>
              </div>

              {/* Request Quote CTA */}
              <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Need a Quote?
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Get a free quote from {business.name} for your project.
                </p>
                <Link href={`/request?business=${business.id}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Request Free Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
