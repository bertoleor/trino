'use client';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error('admin/error', { error: String(error), route: 'admin' });
  }, [error]);
  return (
    <div role="alert" className="p-8">
      <h2 className="text-xl font-bold">Error en administracion</h2>
      <p className="mt-2 text-sm">{String(error.message).slice(0, 200)}</p>
      <button onClick={reset} className="mt-4 min-h-[44px] rounded bg-black px-6 text-white">
        reintentar
      </button>
    </div>
  );
}
