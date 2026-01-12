'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

export function BusinessSetupPrompt() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <Building2 className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Set Up Your Business Profile</h1>
      <p className="text-neutral-400 mb-8">
        Complete your business profile to start receiving leads from customers in your area.
      </p>
      <Link href="/business/setup">
        <Button size="lg">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </main>
  );
}
