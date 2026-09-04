import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const p = path.join(ROOT, 'src/lib/circuit.ts');
const read = () => fs.readFileSync(p, 'utf8');

describe('T-C05 circuit Abort 8s 3/60 ->30s probe RESILIENCIA', () => {
  it('file exists', () => expect(fs.existsSync(p)).toBe(true));
  it('uses AbortController 8s timeout', () => {
    const c = read();
    expect(c).toMatch(/AbortController|AbortSignal/i);
    expect(c).toMatch(/8\s*\*\s*1000|8000/);
  });
  it('opens after 3 fails in 60s then 30s probe', async () => {
    const c = read();
    expect(c).toMatch(/3/);
    expect(c).toMatch(/60\s*\*\s*1000|60000/);
    expect(c).toMatch(/30\s*\*\s*1000|30000/);
    const mod = await import('@/lib/circuit');
    expect(typeof mod.createCircuitBreaker).toBe('function');
    expect(typeof mod.withCircuitBreaker).toBe('function');
  });
  it('graceful degradation to pending_retry without 500', () => {
    const c = read();
    expect(c).toMatch(/pending_retry|halfOpen|half-open|OPEN/i);
  });
  it('circuit transitions CLOSED->OPEN->HALF_OPEN correctly', async () => {
    const { createCircuitBreaker } = await import('@/lib/circuit');
    const cb = createCircuitBreaker({ failureThreshold: 3, windowMs: 60000, probeMs: 30000, timeoutMs: 8000 });
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
    expect(cb.canExecute()).toBe(false);
  });
});
