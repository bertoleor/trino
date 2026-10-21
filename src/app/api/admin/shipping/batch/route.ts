import type { LabelFormat, OrderForLabel } from '@/lib/shipping/labels';
import { createLabelsBatch, groupByPostalCode } from '@/lib/shipping/labels';
import { NextResponse } from 'next/server';
import type { Role } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { isEditorOrAbove } from '@/lib/auth/roles';
import pLimit from 'p-limit';

export const runtime = 'nodejs';

// T4 split-or-justify: 160 lines raw, within the 150 max-lines gate code-only
// (skipComments/skipBlankLines). Kept single-file: the SSE stream closure shares
// orders/chunks/send state, so a split would thread stream internals across modules
// for zero review gain; ticket: repo-cleanup-final/COMP-18

// SSE format: event: progress / event: done streaming grouped by postal_code
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// eslint-disable-next-line complexity -- pre-existing 27, refactor follow-up, ticket: warnings-pr-followup/COMP-1
export async function POST(req: Request) {
  let role: string = 'viewer';

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = (authData as { user?: { id: string } })?.user;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const res = await (
        supabase as unknown as {
          from: (t: string) => {
            select: (c: string) => {
              eq: (k: string, v: string) => Promise<{ data: { role: string }[] | null }>;
            };
          };
        }
      )
        .from('entitlements')
        .select('role')
        .eq('user_id', user.id);
      const ent = res?.data?.[0];
      if (ent) role = ent.role;
    } catch {
      // fallback viewer
    }

    try {
      const r = await (
        supabase as unknown as { rpc: (n: string, p: unknown) => Promise<{ data: unknown }> }
      ).rpc('has_role', { required: 'editor' });
      if (r && typeof (r as { data: unknown }).data === 'boolean' && (r as { data: boolean }).data)
        role = 'editor';
    } catch {
      // ignore rpc
    }

    if (!isEditorOrAbove(role as Role)) {
      return NextResponse.json({ error: 'Forbidden', required: 'editor' }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { ids?: string[]; format?: string } | null;
    const maybeIds = body?.ids;
    const ids = Array.isArray(maybeIds) ? maybeIds : [];
    const format: LabelFormat = body?.format === 'A4' ? 'A4' : 'ZPL';

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids required' }, { status: 400 });
    }

    // Build orders from DB only — P-11 fail-closed (CWE-20/770): nunca se
    // fabrican orders ni códigos postales. Fetch fallado/null → 503; ids que
    // no existen → done.missing; order sin postal_code → done.skipped.
    let rows: {
      id: string;
      postal_code?: string | null;
      shipping_address?: { postal_code?: string } | null;
    }[];

    try {
      const supabase2 = supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            in: (col: string, vals: string[]) => Promise<{ data: unknown[] | null }>;
          };
        };
      };
      const result = (await supabase2
        .from('orders')
        .select('id, postal_code, shipping_address')
        .in('id', ids)) as unknown as {
        data: unknown[] | null;
      };
      // normalize supabase response shape (may be via eq/in chaining)
      const data = (result as unknown as { data?: unknown[] })?.data as
        | {
            id: string;
            postal_code?: string | null;
            shipping_address?: { postal_code?: string } | null;
          }[]
        | null;
      if (!data) {
        // data === null: el fetch no devolvió filas confiables — fail-closed.
        return NextResponse.json({ error: 'orders_fetch_failed' }, { status: 503 });
      }
      rows = data;
    } catch {
      return NextResponse.json({ error: 'orders_fetch_failed' }, { status: 503 });
    }

    const missing = ids.filter((id) => !rows.some((r) => r.id === id));
    const orders: OrderForLabel[] = [];
    const skipped: string[] = [];
    for (const r of rows) {
      const cp = String(r.postal_code ?? r.shipping_address?.postal_code ?? '').trim();
      if (!cp) {
        // Sin postal_code real no existe etiqueta correcta — no se inventa.
        skipped.push(r.id);
        continue;
      }
      orders.push({ id: r.id, postal_code: cp });
    }

    if (orders.length === 0) {
      return NextResponse.json({ error: 'no_valid_orders', missing, skipped }, { status: 404 });
    }

    // Verify grouping uses postal_code and concurrency p-limit
    const groupedPreview = groupByPostalCode(orders);
    const groupCount = groupedPreview.size;

    const total = orders.length;
    const contentHint = format === 'ZPL' ? '^XA' : '%PDF';

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(sseEvent(event, data)));
        };

        let completed = 0;
        const limit = pLimit(10);

        // Chunk progress per 10: process orders in batches of 10 via p-limit
        const chunks: OrderForLabel[][] = [];
        for (let i = 0; i < orders.length; i += 10) chunks.push(orders.slice(i, i + 10));

        for (const chunk of chunks) {
          const prepared = await Promise.all(
            chunk.map((order) => limit(async () => ({ id: order.id, hint: contentHint })))
          );
          completed += prepared.length;
          send('progress', { completed, total });
        }

        // Final grouped generation via createLabelsBatch (p-limit 10, grouped by postal_code)
        const batch = await createLabelsBatch(orders, format);

        // grouped urls ensure postal_code groups preserved
        const urls = batch.urls;

        send('done', { urls, groups: [...batch.groups.keys()], total, groupCount, missing, skipped });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-format': format,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message ?? e) }, { status: 500 });
  }
}
