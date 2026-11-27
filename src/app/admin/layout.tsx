import {
  Crop,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScanLine,
  SlidersHorizontal,
  Truck,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';

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

  if (!user) redirect('/staff/login?redirect=/admin');
  if (user.app_metadata?.role !== 'admin') redirect('/account');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
      <aside className="mb-6 flex lg:mb-0 lg:w-52 lg:flex-col">
        <p className="hidden text-xs font-semibold tracking-wide text-zinc-400 uppercase lg:block">
          Panel de administración
        </p>
        <nav className="mt-2 flex gap-4 lg:flex-col">
          <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
            <LayoutDashboard aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>
          <Link href="/admin/pedidos" className="text-zinc-600 hover:text-zinc-900">
            <ReceiptText aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Órdenes</span>
          </Link>
          <Link href="/admin/inventario" className="text-zinc-600 hover:text-zinc-900">
            <Package aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Inventario</span>
          </Link>
          <Link href="/admin/usuarios" className="text-zinc-600 hover:text-zinc-900">
            <UserRound aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Usuarios</span>
          </Link>
          <Link href="/admin/configuracion" className="text-zinc-600 hover:text-zinc-900">
            <SlidersHorizontal aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Configuración</span>
          </Link>
          <Link href="/admin/registrar-socia" className="text-zinc-600 hover:text-zinc-900">
            <UserRoundPlus aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Registrar Socia</span>
          </Link>
          <Link href="/admin/mercader" className="text-zinc-600 hover:text-zinc-900">
            <Truck aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Mercader & Remito</span>
          </Link>
          <Link href="/admin/etiquetas" className="text-zinc-600 hover:text-zinc-900">
            <ScanLine aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Etiquetas</span>
          </Link>
          <Link href="/admin/drops" className="text-zinc-600 hover:text-zinc-900">
            <Crop aria-hidden="true" className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Drops</span>
          </Link>
          <Link href="/admin/perfil" className="text-zinc-600 hover:text-zinc-900">
            <UserRound aria-hidden="true" className="h-[18px] w-[18px]" />
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
