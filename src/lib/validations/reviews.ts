import { z } from 'zod';
export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(3).default([]),
  honeypot: z.string().max(0).optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
export const reviewModerationSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
});
