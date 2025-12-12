import { NextResponse } from 'next/server';
import { stripe, PRICING_TIERS, PricingTierId } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { businessId, tierId } = await request.json();

    if (!businessId || !tierId) {
      return NextResponse.json(
        { error: 'Missing businessId or tierId' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!(tierId in PRICING_TIERS)) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*, profiles!businesses_owner_id_fkey(email)')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const tier = PRICING_TIERS[tierId as PricingTierId];
    const customerEmail = business.email || business.profiles?.email;

    // Get or create Stripe customer
    let customerId: string;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('business_id', businessId)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: business.name,
        metadata: {
          business_id: businessId,
        },
      });
      customerId = customer.id;
    }

    // Determine checkout mode and line items
    const isSubscription = 'interval' in tier;

    // Create Stripe Price (in production, you'd create these in Stripe Dashboard)
    const priceData: {
      currency: string;
      unit_amount: number;
      product_data: {
        name: string;
        description: string;
      };
      recurring?: {
        interval: 'month' | 'year';
        interval_count?: number;
      };
    } = {
      currency: 'usd',
      unit_amount: Math.round(tier.price * 100), // Convert to cents
      product_data: {
        name: `AnyTradesman ${tier.name} Plan`,
        description: tier.features.join(', '),
      },
    };

    if (isSubscription && 'interval' in tier) {
      priceData.recurring = {
        interval: tier.interval,
        ...(('intervalCount' in tier && tier.intervalCount) && { interval_count: tier.intervalCount }),
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/subscription`,
      metadata: {
        business_id: businessId,
        tier_id: tierId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
