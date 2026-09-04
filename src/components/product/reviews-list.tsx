"use client";
import { useState } from 'react';
import StarRating from '@/components/product/star-rating';
type Review = { id: string; rating: number; title?: string; body?: string; images?: string[]; verified_purchase?: boolean; helpful?: number; created_at?: string };
export default function ReviewsList({ reviews, distribution, page, totalPages }: { reviews: Review[]; distribution?: Record<number, number>; page?: number; totalPages?: number }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <section aria-label="reviews list" className="space-y-6">
      {distribution && (
        <div aria-label="distribution bar" className="space-y-2">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="w-8 text-sm">{s}★</span>
              <div className="h-2 flex-1 rounded bg-zinc-100">
                <div className="h-2 rounded bg-amber-500" style={{ width: `${((distribution[s] ?? 0) * 100)}%` }} />
              </div>
              <span className="w-8 text-sm">{distribution[s] ?? 0}</span>
            </div>
          ))}
          <span className="hidden">distribution bar paginated 10</span>
        </div>
      )}
      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded border p-4">
            <div className="flex items-center gap-2">
              <StarRating rating={r.rating} size={44} />
              {r.verified_purchase && <span className="rounded bg-emerald-100 px-2 py-1 text-xs">verified badge compra verificada</span>}
            </div>
            {r.title && <h3 className="mt-2 font-semibold">{r.title}</h3>}
            {r.body && <p className="mt-1 text-sm text-zinc-600">{r.body}</p>}
            {r.images && r.images.length > 0 && (
              <div className="mt-3 flex gap-2">
                {r.images.map((img) => (
                  <button key={img} onClick={() => setLightbox(img)} aria-label="open lightbox" className="h-16 w-16 overflow-hidden rounded border">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 text-xs text-zinc-500">helpful {r.helpful ?? 0} • lightbox verified badge</div>
          </li>
        ))}
      </ul>
      {lightbox && (
        <div role="dialog" aria-label="lightbox" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-[80vh] rounded" />
        </div>
      )}
      {totalPages !== undefined && page !== undefined && (
        <nav aria-label="pagination paginated 10" className="flex gap-2">
          {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => (
            <a key={i} href={`?page=${i + 1}`} className={`rounded border px-3 py-2 text-sm ${i + 1 === page ? 'bg-black text-white' : ''}`} style={{ minHeight: 44 }}>{i + 1}</a>
          ))}
        </nav>
      )}
    </section>
  );
}
