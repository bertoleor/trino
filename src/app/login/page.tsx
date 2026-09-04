import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

async function isLoggedIn() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export default async function LoginPage() {
  const user = await isLoggedIn()
  if (user) redirect(user.app_metadata?.role === 'admin' ? '/admin' : '/account')

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <LoginForm />
    </main>
  )
}
