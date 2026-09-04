import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/account')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
      <aside className="mb-6 flex lg:mb-0 lg:w-52 lg:flex-col">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-zinc-400 lg:block">
          Panel de administración
        </p>
        <nav className="mt-2 flex gap-4 lg:flex-col">
          <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
            Productos
          </Link>
          <Link href="/admin/pedidos" className="text-zinc-600 hover:text-zinc-900">
            Pedidos
          </Link>
          <Link href="/admin/categorias" className="text-zinc-600 hover:text-zinc-900">
            Categorías
          </Link>
          <form action={signOut}>
            <button className="text-red-600 hover:underline">Cerrar sesión</button>
          </form>
        </nav>
      </aside>
      <section className="flex-1">{children}</section>
    </div>
  )
}
