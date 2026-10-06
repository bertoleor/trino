import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, phone')
    .eq('id', user?.id ?? '')
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <dl className="mt-6 space-y-2">
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Nombre:</dt>
          <dd>{profile?.full_name ?? '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Email:</dt>
          <dd>{profile?.email ?? user?.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-28 text-zinc-500">Rol:</dt>
          <dd>{profile?.role ?? 'user'}</dd>
        </div>
      </dl>
    </div>
  );
}
