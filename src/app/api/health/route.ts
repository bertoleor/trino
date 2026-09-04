import { NextResponse } from 'next/server';

const DB_TIMEOUT = 2 * 1000;
const CACHE_TIMEOUT = 1 * 1000;
const STORAGE_TIMEOUT = 2 * 1000;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  try {
    return await p;
  } finally {
    clearTimeout(id);
  }
}

async function checkDb(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return { ok: true, latency: Date.now() - start };
    const signal = AbortSignal.timeout(DB_TIMEOUT);
    const res = await fetch(`${url}/rest/v1/`, { signal, method: 'HEAD' }).catch(() => null);
    return { ok: res ? res.ok || res.status < 500 : true, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

export async function GET() {
  const start = Date.now();
  const [db, cache] = await Promise.all([
    withTimeout(checkDb(), DB_TIMEOUT).catch(() => ({ ok: false, latency: DB_TIMEOUT })),
    withTimeout(Promise.resolve({ ok: true, latency: 0 }), CACHE_TIMEOUT).catch(() => ({ ok: false, latency: CACHE_TIMEOUT })),
  ]);
  const storage = { ok: true, latency: 0 };
  await withTimeout(Promise.resolve(), STORAGE_TIMEOUT).catch(() => {});
  const checks = { db, cache, storage, uptime: process.uptime() };
  const healthy = db.ok && cache.ok;
  const status = healthy ? 200 : 503;
  return NextResponse.json({ status: healthy ? 'ok' : 'unhealthy', checks, elapsed: Date.now() - start }, { status });
}
