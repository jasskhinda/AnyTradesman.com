'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  Crown,
  Zap,
  Star,
  CreditCard,
  Shield,
  Building2,
  CheckCircle,
  Headphones,
  UserCheck,
  BarChart3,
  Search,
  MessageSquare,
  BadgeCheck,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

interface SubscriptionData {
  id?: string;
  tier: string;
  plan_id?: string;
  status: string;
  current_period_end?: string;
}

interface SubscriptionViewProps {
  businessId: string;
  subscription: SubscriptionData | null;
  hasStripeCustomer: boolean;
}

// Tier hierarchy for upgrade/downgrade detection
const TIER_RANK: Record<string, number> = {
  basic: 1,
  professional: 2,
  enterprise: 3,
};

// Map pricing tier IDs to DB tier names
function pricingTierToDbTier(tierId: string): string {
  switch (tierId) {
    case 'beta': return 'basic';
    case 'monthly':
    case 'sixMonth': return 'professional';
    case 'yearly': return 'enterprise';
    default: return 'professional';
  }
}

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

const tierDisplayNames: Record<string, string> = {
  basic: 'Early Bird',
  professional: 'Professional',
  enterprise: 'Enterprise (Annual)',
};

function getTierFeatures(tier: string) {
  const allFeatures = [
    { name: 'Unlimited lead access', icon: Search, tiers: ['basic', 'professional', 'enterprise'] },
    { name: 'Verified business badge', icon: BadgeCheck, tiers: ['basic', 'professional', 'enterprise'] },
    { name: 'Priority in search results', icon: Search, tiers: ['basic', 'professional', 'enterprise'] },
    { name: 'Customer messaging', icon: MessageSquare, tiers: ['professional', 'enterprise'] },
    { name: 'Analytics dashboard', icon: BarChart3, tiers: ['professional', 'enterprise'] },
    { name: 'Featured listings', icon: Crown, tiers: ['enterprise'] },
    { name: 'Priority support', icon: Headphones, tiers: ['professional', 'enterprise'] },
    { name: 'Dedicated account manager', icon: UserCheck, tiers: ['enterprise'] },
  ];

  return allFeatures.map((f) => ({
    ...f,
    unlocked: f.tiers.includes(tier),
  }));
}

export function SubscriptionView({ businessId, subscription, hasStripeCustomer }: SubscriptionViewProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    tierId: string;
    tierName: string;
    isUpgrade: boolean;
    price: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isActiveSubscriber = subscription?.status === 'active';

  async function handleSubscribe(tierId: string) {
    setProcessing(tierId);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, tierId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not start checkout. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }

    setProcessing(null);
  }

  async function handleChangePlan(tierId: string) {
    setProcessing(tierId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, newTierId: tierId }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.isUpgrade) {
          setSuccess('Plan upgraded successfully! Your new features are now active.');
        } else {
          setSuccess('Plan changed successfully. Your new plan will take effect at your next billing cycle.');
        }
        setConfirmAction(null);
        // Refresh the page to show updated subscription
        setTimeout(() => router.refresh(), 1500);
      } else {
        setError(data.error || 'Failed to change plan. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setProcessing(null);
  }

  async function handleBillingPortal() {
    setProcessing('portal');

    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not open billing portal. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }

    setProcessing(null);
  }

  // Get the relationship of a pricing tier to the current subscription
  function getTierRelation(tierId: string): 'current' | 'upgrade' | 'downgrade' | 'switch' {
    if (!subscription) return 'upgrade';

    // If we know the exact plan_id, use it for precise matching
    if (subscription.plan_id) {
      if (tierId === subscription.plan_id) return 'current';
    }

    const currentDbTier = subscription.tier;
    const targetDbTier = pricingTierToDbTier(tierId);
    const currentRank = TIER_RANK[currentDbTier] || 0;
    const targetRank = TIER_RANK[targetDbTier] || 0;

    // Same feature tier but different billing cycle (e.g., monthly vs sixMonth)
    if (targetDbTier === currentDbTier) return 'switch';

    if (targetRank > currentRank) return 'upgrade';
    if (targetRank < currentRank) return 'downgrade';
    return 'switch';
  }

  // ─── Active Subscriber View ───────────────────────────────────────────────
  if (isActiveSubscriber) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Your Plan</h1>
          <p className="mt-2 text-neutral-400">
            View your current subscription, change plans, or manage billing.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
            {success}
          </div>
        )}

        {/* Current Plan Card */}
        <Card className="mb-8 bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {tierDisplayNames[subscription.tier] || subscription.tier} Plan
                  </p>
                  <p className="text-sm text-neutral-400">
                    <span className="text-green-400 font-medium">Active</span>
                    {subscription.current_period_end && (
                      <> &bull; Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
              {hasStripeCustomer && (
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  onClick={handleBillingPortal}
                  disabled={processing === 'portal'}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {processing === 'portal' ? 'Opening...' : 'Manage Billing'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Active Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Your Active Features
            </CardTitle>
            <CardDescription>
              Features included with your {tierDisplayNames[subscription.tier] || subscription.tier} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {getTierFeatures(subscription.tier).map((feature) => (
                <div
                  key={feature.name}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    feature.unlocked
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-neutral-800/50 border border-neutral-800 opacity-50'
                  }`}
                >
                  <feature.icon className={`w-4 h-4 flex-shrink-0 ${feature.unlocked ? 'text-green-400' : 'text-neutral-600'}`} />
                  <span className={`text-sm ${feature.unlocked ? 'text-white' : 'text-neutral-500 line-through'}`}>
                    {feature.name}
                  </span>
                  {feature.unlocked && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Plan Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Change Plan</h2>
          <p className="text-neutral-400 text-sm mb-6">
            Upgrades take effect immediately. Downgrades apply at your next billing cycle.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingTiers.map((tier) => {
              const relation = getTierRelation(tier.id);
              const isCurrent = relation === 'current';

              return (
                <Card
                  key={tier.id}
                  className={`relative ${
                    isCurrent
                      ? 'border-green-500 bg-green-500/5 ring-1 ring-green-500/20'
                      : relation === 'upgrade'
                      ? 'border-neutral-700 hover:border-green-500/50 transition-colors'
                      : 'border-neutral-800 hover:border-neutral-700 transition-colors'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white bg-green-600">
                      Current Plan
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-white text-base">{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">${tier.price}</span>
                      <span className="text-neutral-400 text-sm">{tier.period}</span>
                    </div>
                    {tier.billedAs && (
                      <p className="text-xs text-neutral-500 mt-1">{tier.billedAs}</p>
                    )}
                    {tier.savings && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        {tier.savings}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-xs">
                          <Check className="w-3.5 h-3.5 text-green-400 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <div className="text-center text-sm text-green-400 font-medium py-2">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Active
                      </div>
                    ) : relation === 'upgrade' ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setConfirmAction({
                          tierId: tier.id,
                          tierName: tier.name,
                          isUpgrade: true,
                          price: tier.price,
                        })}
                        disabled={!!processing}
                      >
                        <ArrowUp className="w-4 h-4 mr-1" />
                        Upgrade
                      </Button>
                    ) : relation === 'switch' ? (
                      <Button
                        variant="outline"
                        className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        onClick={() => setConfirmAction({
                          tierId: tier.id,
                          tierName: tier.name,
                          isUpgrade: false,
                          price: tier.price,
                        })}
                        disabled={!!processing}
                      >
                        Switch Billing
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                        onClick={() => setConfirmAction({
                          tierId: tier.id,
                          tierName: tier.name,
                          isUpgrade: false,
                          price: tier.price,
                        })}
                        disabled={!!processing}
                      >
                        <ArrowDown className="w-4 h-4 mr-1" />
                        Downgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Priority Support & Account Manager */}
        {(subscription.tier === 'professional' || subscription.tier === 'enterprise') && (
          <Card className="mb-8 bg-neutral-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-red-400" />
                Support & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Headphones className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Priority Support</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    As a {tierDisplayNames[subscription.tier]} subscriber, you get priority response times.
                  </p>
                  <a
                    href="mailto:support@anytradesman.com?subject=Priority%20Support%20Request"
                    className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300 mt-2"
                  >
                    support@anytradesman.com
                  </a>
                </div>
              </div>
              {subscription.tier === 'enterprise' && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <UserCheck className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Dedicated Account Manager</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      Your dedicated account manager is here to help you maximize your results.
                    </p>
                    <a
                      href="mailto:accounts@anytradesman.com?subject=Enterprise%20Account%20Support"
                      className="inline-flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 mt-2"
                    >
                      accounts@anytradesman.com
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white">
                  {confirmAction.isUpgrade ? 'Confirm Upgrade' : 'Confirm Downgrade'}
                </CardTitle>
                <CardDescription>
                  {confirmAction.isUpgrade
                    ? `You're upgrading to the ${confirmAction.tierName} plan at $${confirmAction.price}/mo.`
                    : `You're downgrading to the ${confirmAction.tierName} plan at $${confirmAction.price}/mo.`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {confirmAction.isUpgrade ? (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-neutral-300">
                    <p className="font-medium text-green-400 mb-1">Upgrade takes effect immediately</p>
                    <p>You&apos;ll be charged the prorated difference for the remainder of your current billing period. Your new features will be available right away.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-neutral-300">
                    <p className="font-medium text-yellow-400 mb-1">Downgrade takes effect at next billing cycle</p>
                    <p>You&apos;ll keep your current plan features until {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'the end of your billing period'}. After that, your plan will switch to {confirmAction.tierName}.</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => { setConfirmAction(null); setError(null); }}
                    disabled={!!processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={`flex-1 ${confirmAction.isUpgrade ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleChangePlan(confirmAction.tierId)}
                    disabled={!!processing}
                  >
                    {processing ? 'Processing...' : confirmAction.isUpgrade ? 'Upgrade Now' : 'Confirm Downgrade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    );
  }

  // ─── Non-Subscriber / Inactive View ───────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Onboarding Progress (show only if no subscription at all) */}
      {!subscription && (
        <div className="mb-10">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[
              { label: 'Create Account', icon: CheckCircle, done: true },
              { label: 'Business Profile', icon: Building2, done: true },
              { label: 'Choose Plan', icon: CreditCard, done: false, active: true },
            ].map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step.done
                        ? 'bg-green-600 text-white'
                        : step.active
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${step.active ? 'text-white font-medium' : 'text-neutral-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-2 mb-5 ${step.done ? 'bg-green-600' : 'bg-neutral-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          {subscription ? 'Reactivate Your Plan' : 'One Last Step — Choose Your Plan'}
        </h1>
        <p className="mt-2 text-lg text-neutral-400">
          {subscription
            ? 'Your subscription has ended. Choose a plan to reactivate your business.'
            : 'Select a plan to activate your business and start receiving leads from customers in your area.'
          }
        </p>
      </div>

      {/* Inactive subscription notice */}
      {subscription && subscription.status !== 'active' && (
        <Card className="mb-8 bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-medium text-white">
                  Previous Plan: {tierDisplayNames[subscription.tier] || subscription.tier}
                </p>
                <p className="text-sm text-neutral-400">
                  Status: <span className="text-yellow-400">{subscription.status}</span> — Choose a plan below to reactivate.
                </p>
              </div>
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
                Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades apply at your next billing cycle.
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

      {/* Guarantee + Trust */}
      <Card className="bg-neutral-900/50 mb-8">
        <CardContent className="pt-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white mb-2">30-Day Money Back Guarantee</h3>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked. We&apos;re confident you&apos;ll love the quality of leads you receive.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 pb-4">
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          Secure payment via Stripe
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          Cancel anytime
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          No hidden fees
        </span>
      </div>
    </main>
  );
}
