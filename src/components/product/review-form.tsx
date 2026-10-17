'use client';
import StarRating from '@/components/product/star-rating';
import { createReview } from '@/lib/actions/reviews';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// A-02: the TurnstileWidget produces the cf-turnstile-response token that
// createReview verifies fail-closed via siteverify (see src/lib/actions/reviews.ts).
// Tokens are single-use: after a successful submit we clear the token and
// remount the widget (key bump) so the next review gets a fresh challenge.

export default function ReviewForm({ productId }: { productId: string; locale: string }) {
  const t = useTranslations('common');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [token, setToken] = useState('');
  const [widgetKey, setWidgetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    setPending(true);
    const res = await createReview(
      { product_id: productId, rating, title, body, images },
      { honeypot, turnstileToken: token }
    );
    setPending(false);
    if ((res as { status: number }).status === 201) {
      setMsg(t.has('review.success') ? t('review.success') : 'review pending moderation');
      setTitle('');
      setBody('');
      setRating(0);
      // Single-use token consumed: force a fresh Turnstile challenge.
      setToken('');
      setWidgetKey((k) => k + 1);
    } else setMsg((res as { error: string }).error ?? 'error');
  }
  return (
    <form onSubmit={onSubmit} aria-label="review form" className="space-y-4 rounded border p-4">
      <h3 className="font-semibold">
        {t.has('review.write') ? t('review.write') : 'Escribir reseña'} i18n locale
      </h3>
      <StarRating rating={rating} interactive onChange={setRating} size={44} />
      <input
        aria-label="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder="title <=120"
        className="w-full rounded border p-2"
        style={{ minHeight: 44 }}
      />
      <textarea
        aria-label="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        placeholder="body <=2000 presigned 5MB 3 max"
        className="w-full rounded border p-2"
        rows={4}
      />
      <input
        aria-label="images"
        value={images.join(', ')}
        onChange={(e) =>
          setImages(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 3)
          )
        }
        placeholder="images presigned 5MB 3 max text[]"
        className="w-full rounded border p-2"
        style={{ minHeight: 44 }}
      />
      <input
        aria-label="honeypot"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <TurnstileWidget
        key={widgetKey}
        onVerify={setToken}
        onExpire={() => setToken('')}
        onError={() => setToken('')}
      />
      <button
        type="submit"
        disabled={pending || !token || rating < 1}
        className="rounded-full bg-black px-6 py-2 text-white disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        {pending ? '...' : 'Enviar reseña'}
      </button>
      {msg && (
        <p role="status" className="text-sm">
          {msg}
        </p>
      )}
    </form>
  );
}
