import { PAYPAL_ENABLED } from './providers/paypal';
import { STRIPE_ENABLED } from './providers/stripe';
export type Provider = 'mercadopago' | 'stripe' | 'paypal';
export function getPaymentProvider(preferred?: Provider): Provider {
  if (preferred === 'stripe' && STRIPE_ENABLED) return 'stripe';
  if (preferred === 'paypal' && PAYPAL_ENABLED) return 'paypal';
  if (STRIPE_ENABLED) return 'stripe';
  if (PAYPAL_ENABLED) return 'paypal';
  return 'mercadopago';
}
export const ROUTER_FLAGS = 'PAYMENTS_STRIPE_ENABLED PAYPAL_ENABLED mp stripe paypal Strategy';
