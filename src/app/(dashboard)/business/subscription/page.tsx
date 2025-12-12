'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  ArrowLeft,
  Crown,
  Zap,
  Star,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import type { Business, Subscription } from '@/types/database';

const pricingTiers = [
  {
    id: 'beta',
    name: 'Early Bird',
    price: 9.99,
    period: '/mo',
    description: 'Limited time offer',
    badge: 'Best Value',
    badgeColor: 'bg-green-500',
    features: [
      'All premium features',
      'Grandfathered rate forever',
      'Unlimited lead access',
      'Verified business badge',
      'Priority in search results',
    ],
    highlight: true,
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: 29.99,
    period: '/mo',
    billedAs: 'Billed annually at $359.88',
    savings: 'Save 40%',
    features: [
      'Unlimited lead access',
      'Verified business badge',
      'Featured listings',
      'Priority support',
      'Advanced analytics',
      'Dedicated account manager',
    ],
    popular: true,
  },
  {
    id: 'sixMonth',
    name: '6 Month',
    price: 39.99,
    period: '/mo',
    billedAs: 'Billed every 6 months at $239.94',
    savings: 'Save 20%',
    features: [
      'Unlimited lead access',
      'Verified business badge',
      'Priority in search results',
      'Customer messaging',
      'Analytics dashboard',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 49.99,
    period: '/mo',
    features: [
      'Unlimited lead access',
      'Verified business badge',
      'Priority in search results',
      'Customer messaging',
      'Analytics dashboard',
    ],
  },
];

const payPerLeadTier = {
  id: 'payPerLead',
  name: 'Pay Per Lead',
  price: 19.99,
  period: '/lead',
  description: 'No subscription required',
  features: [
    'No monthly commitment',
    'Pay only for leads you want',
    'View lead details before purchase',
    'Perfect for getting started',
  ],
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!businessData) {
      router.push('/business/setup');
      return;
    }

    setBusiness(businessData);

    // Fetch subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessData.id)
      .single();

    if (subData) {
      setSubscription(subData);
    }

    setLoading(false);
  }

  async function handleSubscribe(tierId: string) {
    if (!business) return;

    setProcessing(tierId);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          tierId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }

    setProcessing(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-neutral-800 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/business">
            <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Choose Your Plan</h1>
            <p className="mt-1 text-neutral-400">Select a subscription to start receiving leads</p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="mb-8 bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-medium text-white">
                      Current Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Status: {subscription.status}
                      {subscription.current_period_end && (
                        <> • Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Early Bird Banner */}
        <Card className="mb-8 bg-gradient-to-r from-green-500/20 to-red-500/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Early Bird Special!</h3>
                <p className="text-neutral-300 mt-1">
                  Be one of the first 100 businesses to join and lock in our lowest rate of <strong className="text-green-400">$9.99/month forever</strong>.
                  This grandfathered rate will never increase!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${
                tier.highlight
                  ? 'border-green-500 bg-green-500/5'
                  : tier.popular
                  ? 'border-red-500 bg-red-500/5'
                  : ''
              }`}
            >
              {tier.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white ${tier.badgeColor}`}>
                  {tier.badge}
                </div>
              )}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white bg-red-500">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white">{tier.name}</CardTitle>
                {tier.description && (
                  <CardDescription>{tier.description}</CardDescription>
                )}
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-neutral-400">{tier.period}</span>
                </div>
                {tier.billedAs && (
                  <p className="text-xs text-neutral-500 mt-1">{tier.billedAs}</p>
                )}
                {tier.savings && (
                  <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                    {tier.savings}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    tier.highlight
                      ? 'bg-green-600 hover:bg-green-700'
                      : tier.popular
                      ? ''
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={processing === tier.id}
                >
                  {processing === tier.id ? 'Processing...' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pay Per Lead Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Or Pay Per Lead
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-white">{payPerLeadTier.name}</h3>
                  <p className="text-neutral-400 mt-1">{payPerLeadTier.description}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-white">${payPerLeadTier.price}</span>
                    <span className="text-neutral-400">{payPerLeadTier.period}</span>
                  </div>
                </div>
                <div className="md:text-right">
                  <ul className="space-y-2 mb-4">
                    {payPerLeadTier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-neutral-300 md:justify-end">
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => handleSubscribe(payPerLeadTier.id)}
                    disabled={processing === payPerLeadTier.id}
                  >
                    {processing === payPerLeadTier.id ? 'Processing...' : 'Get Started'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-white mb-2">Can I change plans later?</h3>
                <p className="text-sm text-neutral-400">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-neutral-400">
                  We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-white mb-2">Is there a free trial?</h3>
                <p className="text-sm text-neutral-400">
                  Our Early Bird plan at $9.99/month is our most affordable option. We recommend starting there to see results quickly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-white mb-2">What if the Early Bird pricing ends?</h3>
                <p className="text-sm text-neutral-400">
                  If you sign up for Early Bird, your rate is grandfathered forever. You&apos;ll keep paying $9.99/month even after the promotion ends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guarantee */}
        <Card className="bg-neutral-900/50">
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white mb-2">30-Day Money Back Guarantee</h3>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Not satisfied? Get a full refund within 30 days, no questions asked. We&apos;re confident you&apos;ll love the quality of leads you receive.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
