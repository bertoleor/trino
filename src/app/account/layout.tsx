import { signOut } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
      <aside className="mb-6 flex lg:mb-0 lg:w-52 lg:flex-col">
        <nav className="flex gap-4 lg:flex-col">
          <Link href="/account" className="text-zinc-600 hover:text-zinc-900">
            Mi cuenta
          </Link>
          <Link href="/account/pedidos" className="text-zinc-600 hover:text-zinc-900">
            Mis pedidos
          </Link>
          <form action={signOut}>
            <button className="text-red-600 hover:underline">Cerrar sesión</button>
          </form>
        </nav>
      </aside>
      <section className="flex-1">{children}</section>
    </div>
  );
}
