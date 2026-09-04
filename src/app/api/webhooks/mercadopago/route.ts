import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 1 * 1024 * 1024;

export function parseSignature(header: string): { t: string; v1: string } | null {
  void 't=..,v1=..';
  const parts = header.split(',').map((s) => s.trim());
  const t = parts.find((p) => p.startsWith('t='))?.slice(2) ?? '';
  const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3) ?? header;
  if (!v1) return null;
  return { t, v1 };
}
export function verifyHmac(payload: string, signature: string, secret: string): boolean {
  const parsed = parseSignature(signature);
  if (!parsed) return false;
  const toSign = parsed.t ? `${parsed.t}.${payload}` : payload;
  const expected = crypto.createHmac("sha256", secret).update(toSign).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(parsed.v1, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed, POST only" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature") ?? req.headers.get("x-mp-signature") ?? "";
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) {
    return NextResponse.json({ error: "payload too large 1MB" }, { status: 413 });
  }
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
  if (!secret || !signature || !verifyHmac(raw, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  let body: { id?: string; data?: { id?: string }; type?: string } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    body = {};
  }
  const eventId = body.id ?? body.data?.id ?? crypto.randomUUID();
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase.from("processed_events").select("id").eq("id", eventId).maybeSingle();
    if (existing) {
      return NextResponse.json({ status: "already_processed", dedup: true }, { status: 200 });
    }
    const { error: insertErr } = await supabase.from("processed_events").insert({ id: eventId });
    if (insertErr && insertErr.code === "23505") {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }
    try {
      if (body.type) {
        await supabase.from("audit_logs").insert({
          table_name: "webhooks",
          record_id: eventId,
          action: "insert",
          new_data: body as never,
        });
      }
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (e) {
      await supabase.from("failed_webhooks_log").insert({
        payload: body as never,
        error: String(e),
      });
      return NextResponse.json({ status: "ok_dlq" }, { status: 200 });
    }
  } catch (e) {
    try {
      const supabase = await createClient();
      await supabase.from("failed_webhooks_log").insert({
        payload: body as never,
        error: String(e),
      });
    } catch {}
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}
