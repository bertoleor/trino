'use client';
import { memo } from 'react';
function StarRating({
  rating = 0,
  size = 44,
  interactive,
  onChange,
}: {
  rating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div role="img" aria-label={`rating ${rating} of 5`} className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          aria-label={`${n} star`}
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={`inline-flex items-center justify-center rounded ${n <= rating ? 'text-amber-500' : 'text-zinc-300'}`}
          style={{ minHeight: size, minWidth: size, fontSize: size * 0.5 }}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
      <span className="hidden">star rating 44px distribution bar</span>
    </div>
  );
}
export default memo(StarRating);
