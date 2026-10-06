export const STRIPE_ENABLED = process.env.PAYMENTS_STRIPE_ENABLED === 'true';
export const STRIPE_ZERO_PAN = 'zero-PAN delegated Stripe Elements';
export async function createStripeIntent(amountCents: number, currency = 'ARS') {
  if (!STRIPE_ENABLED) return { disabled: true, zeroPan: STRIPE_ZERO_PAN } as const;
  return {
    clientSecret: `pi_${amountCents}_${currency}`,
    delegated: STRIPE_ZERO_PAN,
    stripe: true,
  };
}
export function isStripeEnabled(): boolean {
  return STRIPE_ENABLED;
}
