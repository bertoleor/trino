'use client';

import { logger } from '@/lib/logger';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error('global-error', { error: String(error), stack: error.stack });
  }, [error]);

  return (
    <html lang="es-AR">
      <body
        style={{
          margin: 0,
          backgroundColor: '#fff8e8',
          color: '#17141b',
          fontFamily: 'sans-serif',
        }}
      >
        <main
          role="alert"
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <section
            style={{
              maxWidth: 520,
              border: '3px solid #17141b',
              backgroundColor: '#fff8e8',
              boxShadow: '8px 8px 0 #17141b',
              padding: 32,
              textAlign: 'center',
            }}
          >
            <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>Error 500</p>
            <h1 style={{ fontSize: 32, margin: '16px 0 0' }}>Algo salió mal</h1>
            <p style={{ fontSize: 16, lineHeight: 1.5 }}>
              Probá de nuevo. Si el problema sigue, volvé en unos minutos.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                marginTop: 24,
                padding: '0 24px',
                border: '2px solid #17141b',
                backgroundColor: '#17141b',
                color: '#fff8e8',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
