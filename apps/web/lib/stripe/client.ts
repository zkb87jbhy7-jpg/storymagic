// ---------------------------------------------------------------------------
// Stripe client — thin wrapper around @stripe/stripe-js for checkout and
// customer-portal flows.
// ---------------------------------------------------------------------------

import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Lazy-initialised Stripe.js instance using the publishable key from the
 * public environment variable.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.warn('[Stripe] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

// ---- API helpers ---------------------------------------------------------

interface CheckoutSessionResponse {
  sessionId: string
}

/**
 * Create a Checkout session on the server and redirect the user to Stripe.
 */
export async function createCheckoutSession(params: {
  priceId: string
  childId?: string
  successUrl?: string
  cancelUrl?: string
}): Promise<void> {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error('Failed to create checkout session')
  }

  const { sessionId } = (await res.json()) as CheckoutSessionResponse
  const stripe = await getStripe()

  if (!stripe) {
    throw new Error('Stripe.js failed to load')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) {
    throw new Error(error.message ?? 'Redirect to checkout failed')
  }
}

interface PortalSessionResponse {
  url: string
}

/**
 * Create a Customer Portal session and redirect the user to manage their
 * subscription.
 */
export async function createPortalSession(): Promise<void> {
  const res = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Failed to create portal session')
  }

  const { url } = (await res.json()) as PortalSessionResponse
  window.location.href = url
}
