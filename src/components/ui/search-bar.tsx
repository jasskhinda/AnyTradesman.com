'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from './button';

interface SearchBarProps {
  size?: 'default' | 'large';
  showButton?: boolean;
  className?: string;
}

export function SearchBar({ size = 'default', showButton = true, className = '' }: SearchBarProps) {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set('q', service);
    if (location) params.set('location', location);
    router.push(`/search?${params.toString()}`);
  };

  const inputClass = size === 'large'
    ? 'px-4 py-4 text-lg'
    : 'px-3 py-2';

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-neutral-800 rounded-xl sm:rounded-full shadow-lg border border-neutral-700 p-2 sm:p-1">
        <div className="flex-1 flex items-center px-4 border-b sm:border-b-0 sm:border-r border-neutral-700 pb-2 sm:pb-0">
          <Search className="w-5 h-5 text-neutral-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="What service do you need?"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={`w-full bg-transparent focus:outline-none text-white placeholder-neutral-400 ${inputClass}`}
          />
        </div>
        <div className="flex-1 flex items-center px-4">
          <MapPin className="w-5 h-5 text-neutral-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="ZIP code or city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`w-full bg-transparent focus:outline-none text-white placeholder-neutral-400 ${inputClass}`}
          />
        </div>
        {showButton && (
          <Button
            type="submit"
            size={size === 'large' ? 'lg' : 'md'}
            className="sm:rounded-full"
          >
            Search
          </Button>
        )}
      </div>
    </form>
  );
}
