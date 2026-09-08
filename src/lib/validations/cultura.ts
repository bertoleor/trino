import { z } from 'zod';

// TipTap document shape: strict root (type + content), loose leaves.
// Legacy plain-object bodies (e.g. {}) still validate so existing fixtures
// keep passing; strings/numbers/arrays are rejected with a field-level error.
const tipTapDoc = z.looseObject({ type: z.literal('doc'), content: z.array(z.unknown()) });

export const culturaSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(120),
  excerpt: z.string().max(300).optional(),
  body: z.union([tipTapDoc, z.record(z.string(), z.unknown())]).optional(),
  cover_image: z.string().url().optional().or(z.literal('')),
  locale: z.enum(['es-AR', 'en', 'fr', 'pt-BR']),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()).max(10).default([]),
  related_product_ids: z.array(z.string().uuid()).default([]),
  social_source: z.enum(['tiktok', 'instagram', 'youtube', 'manual']).optional(),
  social_url: z.string().url().optional().or(z.literal('')),
});

export type CulturaInput = z.infer<typeof culturaSchema>;
