import { z } from 'zod';

export const culturaSchema = z.object({
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(120),
  excerpt: z.string().max(300).optional(),
  body: z.any().optional(),
  cover_image: z.string().url().optional().or(z.literal('')),
  locale: z.enum(['es-AR', 'en', 'fr', 'pt-BR']),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()).max(10).default([]),
  related_product_ids: z.array(z.string().uuid()).default([]),
  social_source: z.enum(['tiktok', 'instagram', 'youtube', 'manual']).optional(),
  social_url: z.string().url().optional().or(z.literal('')),
});

export type CulturaInput = z.infer<typeof culturaSchema>;
