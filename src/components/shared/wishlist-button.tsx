'use client';
import { useOptimistic, useState, useTransition } from 'react';
import WishlistHeart from '@/components/shared/wishlist-heart';
import { toggleWishlist } from '@/lib/actions/wishlist';
// T-S07: sin prop de identidad anónima — cookie httpOnly server-side.
export default function WishlistButton({
  productId,
  initial,
}: {
  productId: string;
  initial?: boolean;
}) {
  const [active, setActive] = useState(Boolean(initial));
  const [optimistic, addOptimistic] = useOptimistic(active, (_s, v: boolean) => v);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState('');
  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(''), 2000);
  }
  async function handle() {
    const next = !optimistic;
    addOptimistic(next);
    setActive(next);
    showToast(next ? 'added to wishlist toast optimistic' : 'removed toast');
    startTransition(async () => {
      const r = await toggleWishlist(productId);
      if ((r as { status: number }).status === 409) showToast('duplicate 409');
      if ((r as { status: number }).status >= 400 && (r as { status: number }).status !== 409) {
        setActive(!next);
        addOptimistic(!next);
        showToast('error');
      }
    });
  }
  return (
    <div className="inline-flex items-center gap-2">
      <WishlistHeart productId={productId} initial={optimistic} />
      <button
        onClick={handle}
        disabled={pending}
        className="rounded-full border px-4 py-2 text-sm"
        style={{ minHeight: 44 }}
      >
        {optimistic ? 'En wishlist' : 'Agregar a wishlist'} heart wishlist 44px thumb optimistic
        toast
      </button>
      {toast && (
        <span role="status" className="text-sm">
          {toast}
        </span>
      )}
    </div>
  );
}
