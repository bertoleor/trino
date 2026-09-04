import pLimit from 'p-limit';

export type LabelFormat = 'A4' | 'ZPL';

export type OrderForLabel = {
  id: string;
  postal_code: string;
  recipient?: string;
  address?: string;
};

export type CreateLabelsOpts = {
  concurrency?: number;
  onGenerate?: () => Promise<void> | void;
};

export function groupByPostalCode(orders: OrderForLabel[]): Map<string, OrderForLabel[]> {
  const map = new Map<string, OrderForLabel[]>();
  for (const o of orders) {
    const key = (o.postal_code ?? '').trim() || 'unknown';
    const arr = map.get(key);
    if (arr) arr.push(o);
    else map.set(key, [o]);
  }
  return map;
}

function generateZPL(order: OrderForLabel): string {
  return `^XA^FO50,50^ADN,36,20^FD${order.id} CP${order.postal_code} ${order.recipient ?? ''}^FS^XZ`;
}

function generateA4Page(order: OrderForLabel, idx: number, total: number): string {
  return `%PDF-1.4 Page ${idx + 1}/${total} id:${order.id} cp:${order.postal_code} recipient:${order.recipient ?? ''}`;
}

export async function createLabelsBatch(
  orders: OrderForLabel[],
  format: LabelFormat,
  opts: CreateLabelsOpts = {},
): Promise<{ groups: Map<string, string>; urls: string[]; total: number }> {
  const grouped = groupByPostalCode(orders);
  const concurrency = opts.concurrency ?? 10;
  const limit = pLimit(concurrency);
  const groups = new Map<string, string>();

  const tasks: Promise<void>[] = [];

  for (const [postal, list] of grouped) {
    tasks.push(
      limit(async () => {
        if (opts.onGenerate) await opts.onGenerate();
        // generate per-order then join per group
        const parts = await Promise.all(
          list.map((order, idx) =>
            limit(async () => {
              if (opts.onGenerate) await opts.onGenerate();
              if (format === 'ZPL') return generateZPL(order);
              return generateA4Page(order, idx, list.length);
            }),
          ),
        );

        let blob: string;
        if (format === 'ZPL') {
          blob = parts.join('\n');
        } else {
          const header = '%PDF-1.4\n';
          blob = header + parts.join('\n---PAGE---\n');
          // ensure contains Page marker
          if (!blob.includes('Page')) blob += '\nPage 1';
        }
        groups.set(postal, blob);
      }),
    );
  }

  await Promise.all(tasks);

  const urls = [...groups.keys()].map((cp) => `blob:${format.toLowerCase()}/${cp}/${Date.now()}`);

  return { groups, urls, total: orders.length };
}

export function getLabelContentType(format: LabelFormat): string {
  return format === 'ZPL' ? 'text/plain' : 'application/pdf';
}

export function getLabelExtension(format: LabelFormat): string {
  return format === 'ZPL' ? 'zpl' : 'pdf';
}
