import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import type { Business } from '@/types/database';

interface BusinessCardProps {
  business: Business & {
    distance_miles?: number;
    categories?: { name: string; slug: string }[];
  };
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/business/${business.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-gray-100">
        {business.cover_image_url ? (
          <Image
            src={business.cover_image_url}
            alt={business.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600" />
        )}

        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-16 h-16 rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={`${business.name} logo`}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Verified Badge */}
        {business.is_verified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-8 pb-4 px-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {business.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mt-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium text-gray-900">
            {business.rating_average?.toFixed(1) || '0.0'}
          </span>
          <span className="ml-1 text-sm text-gray-500">
            ({business.rating_count || 0} reviews)
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {business.city}, {business.state}
            {business.distance_miles !== undefined && (
              <span className="ml-1">
                ({business.distance_miles.toFixed(1)} mi away)
              </span>
            )}
          </span>
        </div>

        {/* Categories */}
        {business.categories && business.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {business.categories.slice(0, 3).map((category) => (
              <span
                key={category.slug}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {business.description}
          </p>
        )}
      </div>
    </Link>
  );
}
