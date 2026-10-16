import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// A-02 slice B: static source guards (split from behavior spec — max-lines 150).
// The runtime contract (fail-closed siteverify inside createReview) lives in
// t-a02-reviews-turnstile.test.ts; this file pins the source-level contract:
// dead code removed, widget wired, no unread schema fields.

const ROOT = path.resolve(__dirname, '../..');
const formPath = path.join(ROOT, 'src/components/product/review-form.tsx');
const actionsPath = path.join(ROOT, 'src/lib/actions/reviews.ts');
const proxyPath = path.join(ROOT, 'src/proxy.ts');
const schemaPath = path.join(ROOT, 'src/lib/validations/reviews.ts');

describe('A-02 source contracts (dead code removed, widget wired)', () => {
  it('review-form wires the real TurnstileWidget and no longer sends a dummy token', () => {
    const c = fs.readFileSync(formPath, 'utf8');
    expect(c).not.toMatch(/dummy-turnstile/);
    expect(c).not.toMatch(/value="turnstile-token"/);
    expect(c).toMatch(/TurnstileWidget/);
    expect(c).toMatch(/cf-turnstile-response/);
    expect(c).toMatch(/onVerify/);
  });

  it('createReview owns a fail-closed turnstile gate with security audit', () => {
    const c = fs.readFileSync(actionsPath, 'utf8');
    expect(c).toMatch(/verifyTurnstile/);
    expect(c).toMatch(/turnstile_403/);
    expect(c).toMatch(/enqueueSecurityAudit/);
    expect(c).toMatch(/turnstileToken/);
  });

  it('proxy no longer carries the dead path gate that 403-blocked Server Action POSTs', () => {
    const c = fs.readFileSync(proxyPath, 'utf8');
    expect(c).not.toMatch(/api\/contact/);
    expect(c).not.toMatch(/needsTurnstile/);
    expect(c).not.toMatch(/cf-turnstile-response/);
    expect(c).not.toMatch(/verifyTurnstile/);
    // The cheap proxy honeypot bait stays (defense in depth).
    expect(c).toMatch(/honeypot/i);
  });

  it('reviews schema no longer declares an unread turnstileToken input field', () => {
    const c = fs.readFileSync(schemaPath, 'utf8');
    expect(c).not.toMatch(/turnstileToken/);
  });
});
