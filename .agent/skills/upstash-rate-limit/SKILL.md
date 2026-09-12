---
name: upstash-rate-limit
description: >
  API rate limiting with Upstash Redis for PAEONIA. Trigger: When adding rate limiting to API routes
  - sliding window, 429s, proxy.ts.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

## Limit Decision Tree

```
Route is auth (login/signup)?       → strictest limit, fail-CLOSED
Route is compute (astrology/PDF/    → strict limit, fail-OPEN with log
  geocoding)?
Other route?                        → standard limit, fail-OPEN
Limit exceeded?                     → 429 + Retry-After header
```

## Sliding-Window Setup (REQUIRED)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// ✅ ALWAYS: sliding window — smooth limits, no burst at window edges
const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts/min
  prefix: 'rl:auth',
});

const computeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'rl:compute',
});

const standardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:std',
});

// ❌ NEVER: fixed windows for auth — attackers get a free burst on rollover
```

## Identifier Strategy (REQUIRED)

```typescript
// ✅ ALWAYS: authenticated user id when available, else IP
function getIdentifier(req: Request, userId?: string): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return userId ? `user:${userId}` : `ip:${ip}`;
}

// ❌ NEVER: IP alone for authenticated routes
// Shared NAT IPs would throttle innocent users together — NO
```

## 429 + Retry-After Responses (REQUIRED)

```typescript
// ✅ ALWAYS: 429 with Retry-After so clients back off correctly
const { success, reset } = await computeLimiter.limit(getIdentifier(req));

if (!success) {
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return new Response('Too many requests. Intentá de nuevo en unos minutos.', {
    status: 429,
    headers: { 'Retry-After': String(retryAfter) },
  });
}

// ❌ NEVER: bare 403/500 for rate limits, or 429 without Retry-After
```

## Applying in proxy.ts (REQUIRED)

PAEONIA uses `proxy.ts` (Next.js 16), NOT `middleware.ts`.

```typescript
// ✅ ALWAYS: enforce limits at the edge in proxy.ts
import { NextResponse } from 'next/server';

export default async function proxy(req: Request): Promise<Response> {
  if (req.url.includes('/api/auth')) {
    const { success } = await authLimiter.limit(getIdentifier(req));
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intentá de nuevo en unos minutos.' },
        { status: 429 }
      );
    }
  }
  return NextResponse.next();
}

// ❌ NEVER: create middleware.ts — Next.js 16 uses proxy.ts
```

## Fail-Closed vs Fail-Open

```typescript
// ✅ Auth routes: fail-CLOSED — Redis down means deny, not free entry
try {
  const { success } = await authLimiter.limit(id);
  if (!success) return tooManyRequests();
} catch {
  return new Response('Service unavailable', { status: 503 });
}

// ✅ Other routes: fail-OPEN with logging — availability over strictness
try {
  const { success } = await computeLimiter.limit(id);
  if (!success) return tooManyRequests();
} catch (error) {
  console.error('Rate limiter unavailable, allowing request', error);
}
```

## Stricter Routes (PAEONIA)

Apply compute-level or stricter limits to: astrology calculations (CPU-heavy), PDF generation
(memory-heavy), Nominatim geocoding (third-party quota). These protect both Vercel budgets and
external quotas.

## Keywords

upstash, rate limit, redis, sliding window, 429, proxy, throttling, Retry-After
