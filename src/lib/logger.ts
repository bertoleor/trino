type Level = 'error' | 'warn' | 'info' | 'debug';
type Meta = Record<string, unknown>;

function emit(level: Level, message: string, meta: Meta = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    ...meta,
  };
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { Sentry?: { captureMessage: (m: string, c: unknown) => void } }).Sentry) {
    // Sentry handled via instrumentation.ts OTel bridge — no direct console
  }
  return entry;
}

export const logger = {
  error: (msg: string, meta?: Meta) => emit('error', msg, meta),
  warn: (msg: string, meta?: Meta) => emit('warn', msg, meta),
  info: (msg: string, meta?: Meta) => emit('info', msg, meta),
  debug: (msg: string, meta?: Meta) => emit('debug', msg, meta),
};
