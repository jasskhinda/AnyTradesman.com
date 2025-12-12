import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

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
