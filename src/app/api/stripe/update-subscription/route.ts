import { NextResponse } from 'next/server';
import { getStripe, PRICING_TIERS, PricingTierId } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

// Tier hierarchy for determining upgrade vs downgrade
const TIER_RANK: Record<string, number> = {
  basic: 1,
  professional: 2,
  enterprise: 3,
};

function mapTierToDbTier(tierId: string): string {
  switch (tierId) {
    case 'beta': return 'basic';
    case 'monthly':
    case 'sixMonth': return 'professional';
    case 'yearly': return 'enterprise';
    default: return 'professional';
  }
}

export async function POST(request: Request) {
  try {
    const { businessId, newTierId } = await request.json();

    if (!businessId || !newTierId) {
      return NextResponse.json(
        { error: 'Missing businessId or newTierId' },
        { status: 400 }
      );
    }

    if (!(newTierId in PRICING_TIERS)) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', businessId)
      .single();

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, tier')
      .eq('business_id', businessId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Check if they're trying to switch to the same tier
    const newDbTier = mapTierToDbTier(newTierId);
    if (newDbTier === subscription.tier) {
      return NextResponse.json(
        { error: 'You are already on this plan tier' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Fetch current Stripe subscription to get the item ID
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id,
      { expand: ['items.data'] }
    );

    const subscriptionItemId = stripeSubscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Could not find subscription item' },
        { status: 500 }
      );
    }

    // Determine if upgrade or downgrade
    const currentRank = TIER_RANK[subscription.tier] || 0;
    const newRank = TIER_RANK[newDbTier] || 0;
    const isUpgrade = newRank > currentRank;

    // Build the new price
    const tier = PRICING_TIERS[newTierId as PricingTierId];
    const priceData: {
      currency: string;
      unit_amount: number;
      product_data: { name: string };
      recurring?: { interval: 'month' | 'year'; interval_count?: number };
    } = {
      currency: 'usd',
      unit_amount: Math.round(tier.price * 100),
      product_data: {
        name: `AnyTradesman ${tier.name} Plan`,
      },
    };

    if ('interval' in tier) {
      priceData.recurring = {
        interval: tier.interval,
        ...(('intervalCount' in tier && tier.intervalCount) && {
          interval_count: tier.intervalCount,
        }),
      };
    }

    // Create a Stripe Price
    const newPrice = await stripe.prices.create({
      currency: priceData.currency,
      unit_amount: priceData.unit_amount,
      product_data: priceData.product_data,
      recurring: priceData.recurring,
    });

    // Update the subscription
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{
        id: subscriptionItemId,
        price: newPrice.id,
      }],
      proration_behavior: isUpgrade ? 'create_prorations' : 'none',
      metadata: {
        tier_id: newTierId,
        business_id: businessId,
      },
    });

    return NextResponse.json({
      success: true,
      isUpgrade,
      newTier: newDbTier,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
