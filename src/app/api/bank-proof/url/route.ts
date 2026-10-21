import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const MAX_BYTES = 10 * 1024 * 1024;
const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const schema = z.object({
  orderId: z.string().uuid(),
  contentType: z.string().refine((v) => allowed.includes(v), 'invalid mime'),
  fileName: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }
  const { orderId, contentType } = parsed.data;
  // P-08 (CWE-639 / OWASP A01): el orderId es client-supplied — sin este
  // check cualquier user autenticado firmaba un upload URL para un order
  // ajeno. Ownership server-side contra orders.user_id; 404 fail-close no
  // revela existencia del order.
  const { data: owned } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!owned) return NextResponse.json({ error: 'order not found' }, { status: 404 });
  const size = Number(req.headers.get('x-file-size') ?? MAX_BYTES);
  if (size > MAX_BYTES) return NextResponse.json({ error: 'file too large 10MB' }, { status: 422 });
  const uuid = crypto.randomUUID();
  const ext = contentType === 'application/pdf' ? 'pdf' : contentType.split('/')[1];
  const path = `bank_proofs/${orderId}/${uuid}.${ext}`;
  const { data, error } = await supabase.storage.from('bank_proofs').createSignedUploadUrl(path);
  if (error) {
    // P-09 (CWE-284 / OWASP A01): fail-closed. Si Storage no firma, NO se
    // degrada a una URL de upload no firmada — exponía el path del objeto y
    // evadía la autorización + expiry de la signed URL. 503 y el caller
    // reintentó; sin url/path/token en el body.
    logger.error('bank_proof signed upload url failed', {
      route: 'api/bank-proof/url',
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  }
  return NextResponse.json(
    { url: data.signedUrl, path, token: data.token, elapsed: Date.now() - start },
    { status: 200 }
  );
}
