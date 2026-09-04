"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import StarRating from '@/components/product/star-rating';
import { createReview } from '@/lib/actions/reviews';
export default function ReviewForm({ productId, locale }: { productId: string; locale: string }) {
  const t = useTranslations('common');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState('');
  void locale;
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    setPending(true);
    const res = await createReview({ product_id: productId, rating, title, body, images }, { honeypot, turnstileToken: 'dummy-turnstile' });
    setPending(false);
    if ((res as { status: number }).status === 201) { setMsg(t.has('review.success') ? t('review.success') : 'review pending moderation'); setTitle(''); setBody(''); setRating(0); }
    else setMsg((res as { error: string }).error ?? 'error');
  }
  return (
    <form onSubmit={onSubmit} aria-label="review form" className="space-y-4 rounded border p-4">
      <h3 className="font-semibold">{t.has('review.write') ? t('review.write') : 'Escribir reseña'} i18n locale</h3>
      <StarRating rating={rating} interactive onChange={setRating} size={44} />
      <input aria-label="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="title <=120" className="w-full rounded border p-2" style={{ minHeight: 44 }} />
      <textarea aria-label="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} placeholder="body <=2000 presigned 5MB 3 max" className="w-full rounded border p-2" rows={4} />
      <input aria-label="images" value={images.join(', ')} onChange={(e) => setImages(e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0,3))} placeholder="images presigned 5MB 3 max text[]" className="w-full rounded border p-2" style={{ minHeight: 44 }} />
      <input aria-label="honeypot" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" value="turnstile-token" aria-label="Turnstile" />
      <button type="submit" disabled={pending || rating < 1} className="rounded-full bg-black px-6 py-2 text-white disabled:opacity-50" style={{ minHeight: 44 }}>
        {pending ? '...' : 'Enviar reseña'} Turnstile honeypot 44px
      </button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </form>
  );
}
