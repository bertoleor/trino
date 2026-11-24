import { CATEGORY, FINISH, SUBCATEGORY } from '@/lib/db/facets';
import { z } from 'zod';

const csvList = (separator: string) => (value: string) =>
  value
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid ISO date');

export const beautyAttributesSchema = z.object({
  category: z.enum(CATEGORY),
  subcategory: z.enum(SUBCATEGORY),
  brand: z.string().trim().min(2).max(50),
  shade: z
    .string()
    .trim()
    .regex(/^#?[0-9a-fA-F]{6}$/, 'Shade must be a 6-digit hex without #')
    .transform((s) => s.replace(/^#/, '').toLowerCase()),
  finish: z.enum(FINISH),
});

export const catalogRowSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().trim().min(3).max(120),
    excerpt: z.string().trim().min(20).max(155),
    price_cents: z.number().int().nonnegative(),
    currency: z.literal('ARS'),
    sale_price_cents: z.number().int().positive().nullable().optional(),
    sale_start: isoDate.nullable().optional(),
    sale_end: isoDate.nullable().optional(),
    stock: z.number().int().nonnegative(),
    sku: z.string().trim().min(3).max(32),
    weight_grams: z.number().int().positive().nullable().optional(),
    dimensions_cm: z.string().trim().max(20).nullable().optional(),
    images: z.string().min(1).transform(csvList('|')),
    category: beautyAttributesSchema.shape.category,
    subcategory: beautyAttributesSchema.shape.subcategory,
    brand: beautyAttributesSchema.shape.brand,
    shade: beautyAttributesSchema.shape.shade,
    finish: beautyAttributesSchema.shape.finish,
    tags: z.string().default('').transform(csvList(',')),
    locale: z.enum(['es-AR', 'en', 'fr', 'pt-BR']),
    related_product_slugs: z.string().default('').transform(csvList(',')),
    status: z.enum(['draft', 'published', 'archived']),
  })
  .refine((r) => r.sale_price_cents == null || r.sale_price_cents < r.price_cents, {
    path: ['sale_price_cents'],
    message: 'Sale price must be lower than price',
  })
  .refine(
    (r) => !r.sale_start || !r.sale_end || Date.parse(r.sale_start) < Date.parse(r.sale_end),
    { path: ['sale_end'], message: 'Sale window must be ordered' }
  );

export type CatalogRow = z.infer<typeof catalogRowSchema>;
export type BeautyAttributes = z.infer<typeof beautyAttributesSchema>;
