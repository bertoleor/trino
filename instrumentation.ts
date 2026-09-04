export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger');
    void logger;
    void 'OTel Sentry instrumentation register';
  }
}
