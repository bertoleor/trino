import { z } from 'zod';

// T-P06 (auditoría 34-auditor, P-06 MEDIUM, CWE-284/CWE-20 / OWASP A01):
// POST /api/checkout aceptaba payment_provider/storage_path/email crudos
// del cliente y los persistía sin validar; el status de la orden se derivaba
// de ese provider sin enum ('bank' -> 'pending_verification'). Este schema
// acota la forma y el tamaño de TODO campo client-supplied ANTES de que el
// route toque la DB, y enum-restringe el provider para que el status solo
// pueda derivarse de un valor admitido.

export const MAX_CHECKOUT_ITEMS = 25;
export const MAX_STORAGE_PATH_LEN = 512;
export const MAX_EMAIL_LEN = 254;

/** Only providers the checkout flow can actually settle an order with. */
export const paymentProviderSchema = z.enum(['mercadopago', 'bank']);

const lineItemSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

export const checkoutRequestSchema = z.object({
  line_items: z.array(lineItemSchema).min(1).max(MAX_CHECKOUT_ITEMS),
  total_cents: z.number().int().finite().nonnegative().max(1_000_000_00),
  payment_provider: paymentProviderSchema,
  storage_path: z.string().min(1).max(MAX_STORAGE_PATH_LEN).nullable().optional(),
  email: z.string().email().max(MAX_EMAIL_LEN).nullable().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** Server-side status derivation — never trust a client-supplied status. */
export function orderStatusForProvider(provider: 'mercadopago' | 'bank'): string {
  return provider === 'bank' ? 'pending_verification' : 'pending';
}
