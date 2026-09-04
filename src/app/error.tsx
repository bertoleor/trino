"use client";
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { logger.error('app/error', { error: String(error), stack: error.stack }); }, [error]);
  return <div role="alert" className="p-8"><h2 className="text-xl font-bold">Algo salio mal</h2><p className="mt-2 text-sm">{String(error.message).slice(0,200)}</p><button onClick={reset} className="mt-4 min-h-[44px] rounded bg-black px-6 text-white">reintentar</button></div>;
}
