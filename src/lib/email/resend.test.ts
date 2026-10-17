import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  // Class (not arrow fn): resend.ts constructs with `new Resend(apiKey)`.
  Resend: class {
    emails = { send: sendMock };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ctor arity mirrors real Resend(apiKey) contract; ticket: trino-ci-green/fast-follow
    constructor(_apiKey?: string) {}
  },
}));

import { buildOrderEmailHtml, sendOrderConfirmation, sendOrderStatus } from './resend';

function setEnv(overrides: Record<string, string | undefined> = {}) {
  delete process.env.EMAIL_TEST_MODE;
  delete process.env.EMAIL_TEST_TO;
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.EMAIL_FROM = 'onboarding@resend.dev';
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });
  setEnv();
});

describe('buildOrderEmailHtml', () => {
  it('renders the confirmed template with order id and total', () => {
    const html = buildOrderEmailHtml('confirmed', {
      orderId: 'ord_1',
      to: 'customer@example.com',
      totalCents: 259900,
    });
    expect(html).toContain('Your order is confirmed');
    expect(html).toContain('ord_1');
    expect(html).toContain('$2599.00');
  });

  it('renders the preparing and shipped templates', () => {
    expect(buildOrderEmailHtml('preparing', { orderId: 'ord_2', to: 'a@b.c' })).toContain(
      'being prepared'
    );
    expect(buildOrderEmailHtml('shipped', { orderId: 'ord_3', to: 'a@b.c' })).toContain(
      'on its way'
    );
  });
});

describe('sendOrderConfirmation', () => {
  it('routes to the sandbox recipient by default and uses the order idempotency key', async () => {
    const result = await sendOrderConfirmation({
      orderId: 'ord_1',
      to: 'customer@example.com',
    });
    expect(result).toEqual({ ok: true, id: 'email_123' });
    expect(sendMock).toHaveBeenCalledOnce();
    const [payload, options] = sendMock.mock.calls[0] as [
      { from: string; to: string },
      { idempotencyKey: string },
    ];
    expect(payload.from).toBe('onboarding@resend.dev');
    expect(payload.to).toBe('delivered@resend.dev');
    expect(options.idempotencyKey).toBe('order-email:ord_1:confirmed');
  });

  it('skips without an api key instead of throwing', async () => {
    setEnv({ RESEND_API_KEY: '' });
    const result = await sendOrderConfirmation({ orderId: 'ord_9', to: 'a@b.c' });
    expect(result).toEqual({ ok: false, skipped: 'missing_api_key' });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns the resend error instead of throwing', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'rate limited' } });
    const result = await sendOrderConfirmation({ orderId: 'ord_5', to: 'a@b.c' });
    expect(result).toEqual({ ok: false, error: 'rate limited' });
  });
});

describe('sendOrderStatus', () => {
  it('sends each status with its own idempotency key', async () => {
    await sendOrderStatus({ orderId: 'ord_7', to: 'a@b.c' }, 'shipped');
    const [, options] = sendMock.mock.calls[0] as [unknown, { idempotencyKey: string }];
    expect(options.idempotencyKey).toBe('order-email:ord_7:shipped');
  });

  it('uses the real recipient only in live mode', async () => {
    setEnv({ EMAIL_TEST_MODE: 'live' });
    await sendOrderStatus({ orderId: 'ord_8', to: 'customer@example.com' }, 'preparing');
    const [payload] = sendMock.mock.calls[0] as [{ to: string }];
    expect(payload.to).toBe('customer@example.com');
  });
});
