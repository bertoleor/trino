import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (user.app_metadata?.role !== 'admin') redirect('/account');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
      <aside className="mb-6 flex lg:mb-0 lg:w-52 lg:flex-col">
        <p className="hidden text-xs font-semibold tracking-wide text-zinc-400 uppercase lg:block">
          Panel de administración
        </p>
        <nav className="mt-2 flex gap-4 lg:flex-col">
          <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span className="hidden lg:inline">Dashboard</span>
          </Link>
          <Link href="/admin/pedidos" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span className="hidden lg:inline">Órdenes</span>
          </Link>
          <Link href="/admin/inventario" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">inventory</span>
            <span className="hidden lg:inline">Inventario</span>
          </Link>
          <Link href="/admin/usuarios" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span className="hidden lg:inline">Usuarios</span>
          </Link>
          <Link href="/admin/configuracion" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="hidden lg:inline">Configuración</span>
          </Link>
          <Link href="/admin/registrar-socia" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span className="hidden lg:inline">Registrar Socia</span>
          </Link>
          <Link href="/admin/mercader" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span className="hidden lg:inline">Mercader & Remito</span>
          </Link>
          <Link href="/admin/etiquetas" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">barcode_reader</span>
            <span className="hidden lg:inline">Etiquetas</span>
          </Link>
          <Link href="/admin/drops" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">crop_square</span>
            <span className="hidden lg:inline">Drops</span>
          </Link>
          <Link href="/admin/perfil" className="text-zinc-600 hover:text-zinc-900">
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span className="hidden lg:inline">Perfil</span>
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