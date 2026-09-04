export const PAYPAL_ENABLED = process.env.PAYPAL_ENABLED === 'true';
export const PAYPAL_ZERO_PAN = 'zero-PAN delegated PayPal SDK';
export async function createPayPalOrder(amountCents: number, currency = 'ARS') {
  if (!PAYPAL_ENABLED) return { disabled: true, zeroPan: PAYPAL_ZERO_PAN } as const;
  return { orderId: `pp_${amountCents}_${currency}`, delegated: PAYPAL_ZERO_PAN, paypal: true };
}
export function isPayPalEnabled(): boolean {
  return PAYPAL_ENABLED;
}
