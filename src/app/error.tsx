'use client';

import { logger } from '@/lib/logger';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error('app/error', { error: String(error), stack: error.stack });
  }, [error]);

  return (
    <main
      role="alert"
      className="bg-cream text-ink flex min-h-screen items-center justify-center p-6"
    >
      <section className="border-ink bg-cream shadow-pop-lg max-w-xl border-[3px] p-8 text-center">
        <p className="font-label border-ink bg-lemon text-ink shadow-pop-sm mb-4 inline-block border-2 px-3 py-1 text-xs font-bold uppercase">
          Error 500
        </p>
        <h1 className="font-display text-3xl font-semibold">Algo salió mal</h1>
        <p className="font-body mt-4 text-base">
          Probá de nuevo. Si el problema sigue, volvé en unos minutos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="font-label border-ink bg-ink text-cream shadow-pop mt-8 inline-flex min-h-11 items-center justify-center border-2 px-6 text-xs font-bold uppercase"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
