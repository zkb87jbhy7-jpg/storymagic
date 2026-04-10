// ─── Subscription Types ─── matches DB table: subscriptions (Chapter 7.2)

/**
 * The subscriptions table tier column allows only 'monthly' | 'yearly'.
 * The broader SubscriptionTier (including 'free') is defined in user.ts
 * for the users.subscription_tier column.
 */
export type SubscriptionPlanTier = 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'paused';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionPlanTier;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  books_remaining_this_period: number;
  books_cap_per_period: number;
  free_prints_remaining: number;
  created_at: string;
}
