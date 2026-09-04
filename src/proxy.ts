import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { checkRateLimit } from "@/lib/rate-limit";

const intlMiddleware = createIntlMiddleware(routing);

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: (options.sameSite as "lax" | "strict" | "none") ?? "lax",
            path: "/",
          })
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    url.pathname = user.app_metadata?.role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(url);
  }
  if (user && isAdminRoute && user.app_metadata?.role !== "admin") {
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }
  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  const honeypot = request.headers.get("x-honeypot") ?? request.nextUrl.searchParams.get("hp");
  if (honeypot) {
    return NextResponse.json({ error: "bot detected honeypot" }, { status: 400 });
  }
  if (request.method === "POST") {
    const token = request.headers.get("cf-turnstile-response") ?? "";
    const needsTurnstile = request.nextUrl.pathname.startsWith("/api/contact") || request.nextUrl.pathname.includes("/reviews");
    if (needsTurnstile) {
      const ok = await verifyTurnstile(token);
      if (!ok) return NextResponse.json({ error: "turnstile failed" }, { status: 403 });
    }
  }
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const tier = request.nextUrl.pathname.startsWith("/api/webhooks") ? "webhook" : request.nextUrl.pathname.startsWith("/admin") ? "admin" : "public";
  const rl = await checkRateLimit(`${tier}:${ip}`, tier as never);
  if (!rl.success) {
    return NextResponse.json({ error: "rate limit" }, { status: 429, headers: rl.headers });
  }
  const intlResponse = intlMiddleware(request) as NextResponse | undefined;
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) return intlResponse;
  const response = await updateSession(request);
  if (intlResponse) {
    intlResponse.headers.forEach((v, k) => {
      if (!response.headers.has(k)) response.headers.set(k, v);
    });
  }
  for (const [k, v] of Object.entries(rl.headers)) response.headers.set(k, v);
  const cookieOpts = `HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Path=/`;
  response.headers.set("x-cookie-opts", cookieOpts);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
