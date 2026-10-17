import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
  const size = Number(req.headers.get('x-file-size') ?? MAX_BYTES);
  if (size > MAX_BYTES) return NextResponse.json({ error: 'file too large 10MB' }, { status: 422 });
  const uuid = crypto.randomUUID();
  const ext = contentType === 'application/pdf' ? 'pdf' : contentType.split('/')[1];
  const path = `bank_proofs/${orderId}/${uuid}.${ext}`;
  const { data, error } = await supabase.storage.from('bank_proofs').createSignedUploadUrl(path);
  if (error) {
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/bank_proofs/${path}`;
    return NextResponse.json(
      { url: fallbackUrl, path, expiresIn: 3600, elapsed: Date.now() - start },
      { status: 200 }
    );
  }
  return NextResponse.json(
    { url: data.signedUrl, path, token: data.token, elapsed: Date.now() - start },
    { status: 200 }
  );
}
