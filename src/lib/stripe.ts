import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility - but only use in API routes
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
  get prices() { return getStripe().prices; },
};

// Pricing configuration - matches client requirements
export const PRICING_TIERS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 49.99,
    interval: 'month' as const,
    pricePerMonth: 49.99,
    features: [
      'Unlimited lead access',
      'Verified business badge',
      'Priority in search results',
      'Customer messaging',
      'Analytics dashboard',
    ],
  },
  sixMonth: {
    id: 'sixMonth',
    name: '6 Month',
    price: 239.94, // $39.99 x 6
    interval: 'month' as const,
    intervalCount: 6,
    pricePerMonth: 39.99,
    savings: '20%',
    features: [
      'Everything in Monthly',
      'Save 20% vs monthly',
      'Extended analytics',
      'Priority support',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Annual',
    price: 359.88, // $29.99 x 12
    interval: 'year' as const,
    pricePerMonth: 29.99,
    savings: '40%',
    popular: true,
    features: [
      'Everything in 6 Month',
      'Save 40% vs monthly',
      'Featured listings',
      'Dedicated account manager',
    ],
  },
  payPerLead: {
    id: 'payPerLead',
    name: 'Pay Per Lead',
    price: 19.99,
    type: 'one_time' as const,
    features: [
      'No monthly commitment',
      'Pay only for leads you want',
      'View lead details before purchase',
      'Ideal for starting out',
    ],
  },
  beta: {
    id: 'beta',
    name: 'Early Bird',
    price: 9.99,
    interval: 'month' as const,
    pricePerMonth: 9.99,
    savings: '80%',
    limited: true,
    features: [
      'All premium features',
      'Grandfathered rate forever',
      'Limited time offer',
      'First 100 businesses only',
    ],
  },
} as const;

export type PricingTierId = keyof typeof PRICING_TIERS;
