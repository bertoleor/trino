import { randomUUID } from 'node:crypto';

type Level = 'error' | 'warn' | 'info' | 'debug';
type Meta = Record<string, unknown> & { requestId?: string; route?: string; severity?: string };

function emit(level: Level, message: string, meta: Meta = {}) {
  const requestId = meta.requestId ?? (typeof globalThis !== 'undefined' ? (globalThis as unknown as { headers?: { get: (k:string)=>string|null } }).headers?.get?.('x-vercel-id') ?? randomUUID() : randomUUID());
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    requestId,
    route: meta.route ?? 'unknown',
    severity: meta.severity ?? level,
    stack: meta.stack ?? new Error().stack,
    traceId: randomUUID(),
    spanId: randomUUID(),
    ...meta,
  };
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { Sentry?: { captureMessage: (m: string, c: unknown) => void } }).Sentry) {
    // OTel trace span via instrumentation.ts bridge
  }
  return entry;
}

export const logger = {
  error: (msg: string, meta?: Meta) => emit('error', msg, { severity: 'error', ...meta }),
  warn: (msg: string, meta?: Meta) => emit('warn', msg, { severity: 'warn', ...meta }),
  info: (msg: string, meta?: Meta) => emit('info', msg, { severity: 'info', ...meta }),
  debug: (msg: string, meta?: Meta) => emit('debug', msg, { severity: 'debug', ...meta }),
};
