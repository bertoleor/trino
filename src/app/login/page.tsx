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

export default async function LoginPage() {
  const user = await isLoggedIn();
  if (user) redirect(user.app_metadata?.role === 'admin' ? '/admin' : '/account');

  return (
    <main data-purpose="auth-login-page" className="bg-cream text-ink w-full flex-1">
      <LoginForm />
    </main>
  );
}
