import { z } from 'zod';

// T-S01 (auditoría 34-auditor, S-01 HIGH): POST /api/shipping/rates recibía
// items crudos del cliente y los hasheaba antes de validar. Este schema
// acota la forma y el tamaño ANTES de cualquier trabajo (hash, fan-out,
// cache key), devolviendo 422 temprano.

export const MAX_SHIPPING_ITEMS = 25;
export const MAX_POSTAL_CODE_LEN = 32;

export const shippingItemSchema = z.object({
  weight: z.number().finite().nonnegative().max(100_000),
  dims: z
    .object({
      w: z.number().finite().nonnegative().max(10_000),
      h: z.number().finite().nonnegative().max(10_000),
      d: z.number().finite().nonnegative().max(10_000),
    })
    .optional(),
});

export const shippingRatesRequestSchema = z.object({
  postalCode: z.string().min(1).max(MAX_POSTAL_CODE_LEN),
  items: z.array(shippingItemSchema).max(MAX_SHIPPING_ITEMS).default([]),
});

export type ShippingRatesRequest = z.infer<typeof shippingRatesRequestSchema>;
