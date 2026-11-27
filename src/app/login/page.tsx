import { destinationAfterLogin, safeRedirect } from '@/lib/auth/safe-redirect';
import { LoginForm } from './login-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function isLoggedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

type LoginPageProps = { searchParams: Promise<{ redirect?: string | string[] }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requested = safeRedirect(
    Array.isArray(params.redirect) ? params.redirect[0] : params.redirect
  );
  const user = await isLoggedIn();
  if (user) {
    redirect(destinationAfterLogin(requested, user.app_metadata?.role as string | undefined));
  }

  return (
    <main data-purpose="auth-login-page" className="bg-cream text-ink w-full flex-1">
      <LoginForm redirectTo={requested} />
    </main>
  );
}
