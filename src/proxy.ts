import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Importante: NO ejecutar supabase.auth.getUser() entre crear el client y
  // setAll. Ver docs oficiales de @supabase/ssr.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  // --- Reglas de acceso ---
  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = pathname.startsWith('/account')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (!user && (isAdminRoute || isAccountRoute)) {
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // Un usuario logueado no necesita el login.
    url.pathname = user.app_metadata?.role === 'admin' ? '/admin' : '/'
    return NextResponse.redirect(url)
  }

  if (user && isAdminRoute && user.app_metadata?.role !== 'admin') {
    url.pathname = '/account'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request) as NextResponse | undefined
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) return intlResponse
  const response = await updateSession(request)
  if (intlResponse) {
    intlResponse.headers.forEach((v, k) => {
      if (!response.headers.has(k)) response.headers.set(k, v)
    })
  }
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
