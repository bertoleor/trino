import { z } from 'zod';
export const wishlistSchema = z.object({ product_id: z.string().uuid() });
export type WishlistInput = z.infer<typeof wishlistSchema>;
