import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasRole } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

const intlMiddleware = createIntlMiddleware(routing);

function requiredRole(pathname: string, method: string): Role {
  // hierarchy super_admin(4) > admin(3) > editor(2) > viewer(1)
  if (pathname.includes("/admin/users") || pathname.includes("/admin/roles")) return "super_admin";
  if (method === "DELETE") return "admin";
  if (pathname.startsWith("/admin")) return "editor"; // viewer denied via editor gate
  return "viewer";
}

async function checkHasRole(supabase: { rpc: (n: string, p: unknown) => Promise<{ data: unknown; error: unknown }> }, req: Role): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", { required: req });
    if (!error && typeof data === "boolean") return data;
  } catch {}
  return false;
}

async function logRbacDeny(supabase: { from: (t: string) => { insert: (v: unknown) => Promise<unknown> } }, userId: string, pathname: string, ip: string): Promise<void> {
  try {
    await supabase.from("security_logs").insert({ event: "rbac_403", user_id: userId, ip, metadata: { path: pathname } });
  } catch {}
  try {
    await supabase.from("audit_logs").insert({ table_name: "entitlements", record_id: null, action: "update", old_data: null, new_data: { denied: true, path: pathname }, user_id: userId });
  } catch {}
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/security_logs`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" }, body: JSON.stringify({ event: "rbac_403", ip, path: pathname, user_id: userId }) });
  } catch {}
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/audit_logs`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" }, body: JSON.stringify({ table_name: "rbac", action: "update", old_data: null, new_data: { denied: true, path: pathname } }) });
  } catch {}
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: token }) });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest) {
  const isAdminCookie = request.nextUrl.pathname.startsWith("/admin");
  void (isAdminCookie ? "SameSite=Strict" : "SameSite=Lax");
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          const strictForAdmin = request.nextUrl.pathname.startsWith("/admin") ? "strict" as const : (options.sameSite as "lax" | "strict" | "none") ?? "lax";
          supabaseResponse.cookies.set(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: strictForAdmin, path: "/" });
        });
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (!user && (isAdminRoute || isAccountRoute)) {
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  if (user && isAuthPage) {
    const fallback = (user.app_metadata?.role as string) === "admin" ? "/admin" : "/";
    url.pathname = fallback;
    return NextResponse.redirect(url);
  }
  if (user && isAdminRoute) {
    const reqRole = requiredRole(pathname, request.method);
    let allowed = await checkHasRole(supabase as never, reqRole);
    if (!allowed) {
      try {
        const { data: rows } = await (supabase as never as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => Promise<{ data: { role: string }[] | null }> } } }).from("entitlements").select("role").eq("user_id", user.id) as unknown as { data: { role: string }[] | null };
        if (rows && rows.length > 0) {
          const best = rows.reduce((a, b) => (hasRole(a as Role, b.role as Role) ? a : b.role), rows[0]!.role) as Role;
          // compute via hasRole against reqRole
          const bestRole = rows.map((r) => r.role as Role).reduce((acc, cur) => (hasRole(cur, acc) ? cur : acc), rows[0]!.role as Role);
          allowed = hasRole(bestRole, reqRole);
          void best;
        }
      } catch {}
    }
    if (!allowed) {
      const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
      await logRbacDeny(supabase as never, user.id, pathname, ip);
      return NextResponse.json({ error: "Forbidden", required: reqRole }, { status: 403 });
    }
  }
  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  const honeypot = request.headers.get("x-honeypot") ?? request.nextUrl.searchParams.get("hp");
  if (honeypot) return NextResponse.json({ error: "bot detected honeypot" }, { status: 400 });
  if (request.method === "POST") {
    const token = request.headers.get("cf-turnstile-response") ?? "";
    const needsTurnstile = request.nextUrl.pathname.startsWith("/api/contact") || request.nextUrl.pathname.includes("/reviews");
    if (needsTurnstile) {
      const ok = await verifyTurnstile(token);
      if (!ok) {
        try { await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/security_logs`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" }, body: JSON.stringify({ event: "turnstile_403", ip: request.headers.get("x-forwarded-for") ?? "unknown" }) }); } catch {}
        return NextResponse.json({ error: "turnstile failed" }, { status: 403 });
      }
    }
  }
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const tier = request.nextUrl.pathname.startsWith("/api/webhooks") ? "webhook" : request.nextUrl.pathname.startsWith("/admin") ? "admin" : "public";
  const rl = await checkRateLimit(`${tier}:${ip}`, tier as never);
  if (!rl.success) {
    try { await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/security_logs`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" }, body: JSON.stringify({ event: "rate_limit_429", ip, path: request.nextUrl.pathname }) }); } catch {}
    return NextResponse.json({ error: "rate limit" }, { status: 429, headers: rl.headers });
  }
  const intlResponse = intlMiddleware(request) as NextResponse | undefined;
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) return intlResponse;
  const response = await updateSession(request);
  if (intlResponse) intlResponse.headers.forEach((v, k) => { if (!response.headers.has(k)) response.headers.set(k, v); });
  for (const [k, v] of Object.entries(rl.headers)) response.headers.set(k, v);
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const cookieOpts = `HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=${isAdminPath ? "Strict" : "Lax"}; Path=/`;
  void "security_logs insert on 429/403 rbac_403 audit_logs";
  response.headers.set("x-cookie-opts", cookieOpts);
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
