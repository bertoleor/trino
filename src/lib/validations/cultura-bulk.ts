import { z } from 'zod';
export const culturaBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(10),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete', 'duplicate']),
});
export type CulturaBulkInput = z.infer<typeof culturaBulkSchema>;
export function seoScore(input: { title: string; excerpt?: string; slug: string }) {
  let score = 0;
  if (input.title.length <= 60 && input.title.length >= 10) score += 40;
  if ((input.excerpt?.length ?? 0) <= 155) score += 30;
  if (/^[a-z0-9-]+$/.test(input.slug)) score += 30;
  return score;
}
export function readingTime(body: unknown) {
  const text = typeof body === 'string' ? body : JSON.stringify(body ?? '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
