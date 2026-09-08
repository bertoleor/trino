import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set(['turnstile_403', 'rate_limit_429', 'rbac_403']);
const MAX_BYTES = 8 * 1024;

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

// eslint-disable-next-line complexity -- pre-existing 15, refactor deferred: secret-gated ingest branching; ticket: repo-cleanup-final/COMP-13
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ingestSecret = process.env.AUDIT_INGEST_SECRET;
  if (!ingestSecret) {
    return NextResponse.json({ error: 'audit ingest not configured' }, { status: 503 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!secretsMatch(token, ingestSecret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body: { event?: unknown; ip?: unknown; path?: unknown };
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES) {
      return NextResponse.json({ error: 'payload too large' }, { status: 413 });
    }
    body = raw ? (JSON.parse(raw) as typeof body) : {};
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (typeof body.event !== 'string' || !ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ error: 'invalid event' }, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceRole) {
    return NextResponse.json({ error: 'audit store not configured' }, { status: 503 });
  }
  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { error } = await supabase.from('security_logs').insert({
    event: body.event,
    ip: typeof body.ip === 'string' ? body.ip : 'unknown',
    metadata: typeof body.path === 'string' ? { path: body.path } : {},
  });
  if (error) {
    return NextResponse.json({ error: 'audit insert failed' }, { status: 502 });
  }
  return NextResponse.json({ status: 'ok' }, { status: 202 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
