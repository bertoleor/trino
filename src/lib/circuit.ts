type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface Options {
  failureThreshold?: number;
  windowMs?: number;
  probeMs?: number;
  timeoutMs?: number;
}

export function createCircuitBreaker(opts: Options = {}) {
  const failureThreshold = opts.failureThreshold ?? 3;
  const windowMs = opts.windowMs ?? 60 * 1000;
  const probeMs = opts.probeMs ?? 30 * 1000;
  const timeoutMs = opts.timeoutMs ?? 8 * 1000;

  let state: State = 'CLOSED';
  let failures = 0;
  let windowStart = Date.now();
  let openedAt = 0;

  function getState(): State {
    if (state === 'OPEN' && Date.now() - openedAt >= probeMs) {
      state = 'HALF_OPEN';
    }
    return state;
  }

  function canExecute(): boolean {
    const s = getState();
    return s === 'CLOSED' || s === 'HALF_OPEN';
  }

  function recordSuccess() {
    failures = 0;
    windowStart = Date.now();
    state = 'CLOSED';
  }

  function recordFailure() {
    const now = Date.now();
    if (now - windowStart > windowMs) {
      failures = 1;
      windowStart = now;
      state = 'CLOSED';
      return;
    }
    failures += 1;
    if (failures >= failureThreshold) {
      state = 'OPEN';
      openedAt = now;
    }
  }

  function withTimeout<T>(p: Promise<T>): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return p.finally(() => clearTimeout(id)) as Promise<T>;
  }

  async function exec<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    fallback?: T
  ): Promise<T | { status: string }> {
    if (!canExecute()) {
      if (fallback !== undefined) return fallback;
      return { status: 'pending_retry' } as unknown as T;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await fn(controller.signal);
      recordSuccess();
      return result;
    } catch {
      recordFailure();
      if (fallback !== undefined) return fallback;
      return { status: 'pending_retry' } as unknown as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    getState,
    canExecute,
    recordSuccess,
    recordFailure,
    exec,
    withTimeout,
    timeoutMs,
    failureThreshold,
    windowMs,
    probeMs,
  };
}

export async function withCircuitBreaker<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: Options = {}
): Promise<T | { status: string }> {
  const cb = createCircuitBreaker(opts);
  return cb.exec(fn);
}
