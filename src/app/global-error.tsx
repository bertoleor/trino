"use client";
import { logger } from '@/lib/logger';
import { useEffect } from 'react';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { logger.error('global-error', { error: String(error), stack: error.stack }); }, [error]);
  return <html><body><div role="alert" className="p-8"><h2>Error critico</h2><button onClick={reset} className="min-h-[44px] rounded bg-black px-6 text-white">reintentar</button></div></body></html>;
}
