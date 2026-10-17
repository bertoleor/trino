'use client';
import { useOptimistic, useState, useTransition } from 'react';
import { toggleWishlist } from '@/lib/actions/wishlist';
// T-S07: sin prop de identidad anónima — la resuelve el server desde la
// cookie httpOnly trino_cart_sid (CWE-639).
export default function WishlistHeart({
  productId,
  initial,
}: {
  productId: string;
  initial?: boolean;
}) {
  const [liked, setLiked] = useState(Boolean(initial));
  const [optimisticLiked, addOptimistic] = useOptimistic(liked, (_s, v: boolean) => v);
  const [pending, startTransition] = useTransition();
  async function onToggle() {
    const next = !optimisticLiked;
    addOptimistic(next);
    setLiked(next);
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if ((res as { status: number }).status >= 400) {
        setLiked(!next);
        addOptimistic(!next);
      }
    });
  }
  return (
    <button
      aria-label={optimisticLiked ? 'remove from wishlist' : 'add to wishlist'}
      aria-pressed={optimisticLiked}
      onClick={onToggle}
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full border p-0"
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <span className={optimisticLiked ? 'text-red-600' : 'text-zinc-400'}>
        {optimisticLiked ? '♥' : '♡'}
      </span>
      <span className="hidden">optimistic toast heart 44px thumb</span>
    </button>
  );
}
