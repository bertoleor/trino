import { Resend } from 'resend';
import { logger } from '@/lib/logger';

export type OrderEmailStatus = 'confirmed' | 'preparing' | 'shipped';

export interface OrderEmailInput {
  orderId: string;
  /** Customer address. Ignored unless EMAIL_TEST_MODE=live (test mode default). */
  to: string;
  totalCents?: number;
  itemCount?: number;
}

export type EmailResult =
  { ok: true; id: string } | { ok: false; skipped: string } | { ok: false; error: string };

const TEST_RECIPIENT_FALLBACK = 'delivered@resend.dev';
const FROM_FALLBACK = 'onboarding@resend.dev';

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

/** Test mode is the default: mail goes to the Resend sandbox recipient, never to customers. */
function resolveRecipient(to: string): string {
  if (process.env.EMAIL_TEST_MODE === 'live') return to;
  return process.env.EMAIL_TEST_TO ?? TEST_RECIPIENT_FALLBACK;
}

function resolveSender(): string {
  return process.env.EMAIL_FROM ?? FROM_FALLBACK;
}

function formatTotal(totalCents: number): string {
  return `$${(totalCents / 100).toFixed(2)}`;
}

const STATUS_COPY: Record<OrderEmailStatus, { title: string; heading: string; body: string }> = {
  confirmed: {
    title: 'Order confirmed',
    heading: 'Your order is confirmed',
    body: 'We received your order and the payment details look good. We will notify you when it starts being prepared.',
  },
  preparing: {
    title: 'Order in preparation',
    heading: 'Your order is being prepared',
    body: 'Good news: your order left the queue and is now being prepared with care.',
  },
  shipped: {
    title: 'Order shipped',
    heading: 'Your order is on its way',
    body: 'Your order has shipped. Keep an eye on your inbox for tracking updates.',
  },
};

export function buildOrderEmailHtml(status: OrderEmailStatus, input: OrderEmailInput): string {
  const copy = STATUS_COPY[status];
  const summary =
    input.totalCents !== undefined
      ? `<p>Total: <strong>${formatTotal(input.totalCents)}</strong></p>`
      : '';
  const items =
    input.itemCount !== undefined ? `<p>Items: <strong>${input.itemCount}</strong></p>` : '';
  return (
    `<!doctype html><html lang="en"><body style="font-family: sans-serif; color: #1a1a1a;">` +
    `<h1>${copy.heading}</h1>` +
    `<p>Order <strong>${input.orderId}</strong></p>` +
    `<p>${copy.body}</p>` +
    summary +
    items +
    `</body></html>`
  );
}

function idempotencyKeyFor(orderId: string, status: OrderEmailStatus): string {
  return `order-email:${orderId}:${status}`;
}

async function sendOrderEmail(
  status: OrderEmailStatus,
  input: OrderEmailInput
): Promise<EmailResult> {
  const client = getClient();
  if (!client) {
    logger.warn('resend skipped: missing RESEND_API_KEY', { route: 'lib/email' });
    return { ok: false, skipped: 'missing_api_key' };
  }
  const to = resolveRecipient(input.to);
  if (!to) {
    logger.warn('resend skipped: empty recipient', { route: 'lib/email' });
    return { ok: false, skipped: 'empty_recipient' };
  }
  const copy = STATUS_COPY[status];
  try {
    const { data, error } = await client.emails.send(
      {
        from: resolveSender(),
        to,
        subject: `${copy.title} — order ${input.orderId}`,
        html: buildOrderEmailHtml(status, input),
      },
      { idempotencyKey: idempotencyKeyFor(input.orderId, status) }
    );
    if (error) {
      logger.error('resend send failed', { route: 'lib/email', error: error.message });
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? '' };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error('resend send threw', { route: 'lib/email', error: message });
    return { ok: false, error: message };
  }
}

export function sendOrderConfirmation(input: OrderEmailInput): Promise<EmailResult> {
  return sendOrderEmail('confirmed', input);
}

export function sendOrderStatus(
  input: OrderEmailInput,
  status: OrderEmailStatus
): Promise<EmailResult> {
  return sendOrderEmail(status, input);
}
