import { type NextRequest, NextResponse } from "next/server";
import { applyNonceCsp, nextWithNonce, nonceForRequest } from "@/lib/security/csp";
import { enqueueSecurityAudit, verifyTurnstile } from "@/lib/proxy/turnstile";
import { isRecord, toTypedSupabase } from "@/lib/supabase/typed";
import type { Role } from "@/lib/auth/roles";
import { checkRateLimit } from "@/lib/rate-limit";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { hasRole } from "@/lib/auth/roles";
import { logRbacDeny } from "@/lib/proxy/rbac-audit";
import { logger } from "@/lib/logger";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// ORN-62 P3 RBAC depth: localePrefix is 'always', so every route (incl. /admin)
// arrives locale-prefixed (/es-AR/admin, /en/admin...). Strip the prefix before
// any startsWith gate, otherwise the editor/admin checks below never fire.
export function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

function requiredRole(pathname: string, method: string): Role {
  // hierarchy super_admin(4) > admin(3) > editor(2) > viewer(1)
  if (pathname.includes("/admin/users") || pathname.includes("/admin/roles")) return "super_admin";
  if (method === "DELETE") return "admin";
  if (pathname.startsWith("/admin")) return "editor"; // viewer denied via editor gate
  return "viewer";
}

async function checkHasRole(client: unknown, req: Role): Promise<boolean> {
  try {
    const { data, error } = await toTypedSupabase(client).rpc("has_role", { required: req });
    if (!error && typeof data === "boolean") return data;
  } catch (err) {
    logger.error("proxy_has_role_failed", { route: "proxy/admin", error: String(err) });
  }
  return false;
}

function isAuthTierPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth")) return true;
  return pathname.includes("/login") || pathname.includes("/signup");
}

type EntitlementRow = { role: string };

async function fetchEntitlementRoles(client: unknown, userId: string): Promise<EntitlementRow[] | null> {
  const { data, error } = await toTypedSupabase(client).from("entitlements").select("role,user_id").limit(100);
  if (error || !Array.isArray(data)) return null;
  return data.filter(
    (v): v is EntitlementRow => isRecord(v) && typeof v.role === "string" && v.user_id === userId
  );
}

// eslint-disable-next-line complexity -- pre-existing 17, refactor deferred: auth-critical path, substantive hardening owned by T4; ticket: repo-cleanup-final/COMP-10
export async function updateSession(request: NextRequest, nonce?: string) {
  const rawPathname = request.nextUrl.pathname;
  const pathname = stripLocalePrefix(rawPathname);
  const isAdminCookie = pathname.startsWith("/admin");
  let supabaseResponse = nextWithNonce(request, nonce);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- boot-validated public env via src/config/env.ts validateEnv (t-a03-env), substantive proxy edits owned by T4; ticket: repo-cleanup-final/COMP-17
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = nextWithNonce(request, nonce);
        cookiesToSet.forEach(({ name, value, options }) => {
          const strictForAdmin = isAdminCookie ? "strict" as const : (options.sameSite as "lax" | "strict" | "none") ?? "lax";
          supabaseResponse.cookies.set(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: strictForAdmin, path: "/" });
        });
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  // pathname/rawPathname: stripped locale prefix from above (ORN-62).
  const url = request.nextUrl.clone();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (!user && (isAdminRoute || isAccountRoute)) {
    url.pathname = "/login";
    url.searchParams.set("redirect", rawPathname);
    return NextResponse.redirect(url);
  }
  if (user && isAuthPage) {
    const fallback = (user.app_metadata?.role as string) === "admin" ? "/admin" : "/";
    url.pathname = fallback;
    return NextResponse.redirect(url);
  }
  if (user && isAdminRoute) {
    const reqRole = requiredRole(pathname, request.method);
    let allowed = await checkHasRole(supabase, reqRole);
    if (!allowed) {
      try {
        const rows = await fetchEntitlementRoles(supabase, user.id);
        if (rows && rows.length > 0) {
          // compute via hasRole against reqRole
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- rows.length guard above narrows index, T4-owned narrowing; ticket: repo-cleanup-final/COMP-17
          const bestRole = rows.map((r) => r.role as Role).reduce((acc, cur) => (hasRole(cur, acc) ? cur : acc), rows[0]!.role as Role);
          allowed = hasRole(bestRole, reqRole);
        }
      } catch (err) {
        logger.error("proxy_entitlements_fallback_failed", { route: "proxy/admin", error: String(err) });
      }
    }
    if (!allowed) {
      const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
      await logRbacDeny(supabase, user.id, pathname, ip);
      return NextResponse.json({ error: "Forbidden", required: reqRole }, { status: 403 });
    }
  }
  return supabaseResponse;
}

// eslint-disable-next-line complexity -- pre-existing 20, refactor deferred: auth-critical path, substantive hardening owned by T4; ticket: repo-cleanup-final/COMP-9
export async function proxy(request: NextRequest) {
  const honeypot = request.headers.get("x-honeypot") ?? request.nextUrl.searchParams.get("hp");
  if (honeypot) return NextResponse.json({ error: "bot detected honeypot" }, { status: 400 });
  if (request.method === "POST") {
    const token = request.headers.get("cf-turnstile-response") ?? "";
    const needsTurnstile = request.nextUrl.pathname.startsWith("/api/contact") || request.nextUrl.pathname.includes("/reviews");
    if (needsTurnstile) {
      const ok = await verifyTurnstile(token);
      if (!ok) {
        enqueueSecurityAudit("turnstile_403", { ip: request.headers.get("x-forwarded-for") ?? "unknown", path: request.nextUrl.pathname }, request.nextUrl.origin);
        return NextResponse.json({ error: "turnstile failed" }, { status: 403 });
      }
    }
  }
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const path = request.nextUrl.pathname;
  const tier = path.startsWith("/api/webhooks")
    ? "webhook"
    : path.startsWith("/admin")
      ? "admin"
      : isAuthTierPath(path)
        ? "auth"
        : "public";
  const rl = await checkRateLimit(`${tier}:${ip}`, tier);
  if (!rl.success) {
    enqueueSecurityAudit("rate_limit_429", { ip, path: request.nextUrl.pathname }, request.nextUrl.origin);
    return NextResponse.json({ error: "rate limit" }, { status: 429, headers: rl.headers });
  }
  const intlResponse = intlMiddleware(request) as NextResponse | undefined;
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) return intlResponse;
  const nonce = nonceForRequest(request.nextUrl.pathname);
  const response = await updateSession(request, nonce);
  if (intlResponse) intlResponse.headers.forEach((v, k) => { if (!response.headers.has(k)) response.headers.set(k, v); });
  for (const [k, v] of Object.entries(rl.headers)) response.headers.set(k, v);
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const cookieOpts = `HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=${isAdminPath ? "Strict" : "Lax"}; Path=/`;
  response.headers.set("x-cookie-opts", cookieOpts);
  applyNonceCsp(response, nonce);
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
