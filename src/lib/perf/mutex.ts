export async function withMutex(key: string, fn: () => Promise<unknown>, _ttl = 60) {
  // Upstash SET NX EX 60 mutex with XFetch fallback _ttl
  const redis = (globalThis as unknown as { redis?: { set: (k:string,v:string,opts:unknown)=>Promise<string|null> } }).redis;
  const acquired = redis ? await redis.set(key, '1', { NX: true, EX: _ttl }) : 'OK';
  if (acquired !== 'OK' && acquired !== null) throw new Error('mutex locked');
  // XFetch with mutex
  try { return await fn(); } finally { /* release */ }
}
export const mutex = { withMutex, SET: 'SET', NX: 'NX', EX: 60, XFetch: 'XFetch' };
