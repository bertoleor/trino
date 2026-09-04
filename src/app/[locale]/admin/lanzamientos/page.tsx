import { createClient } from '@/lib/supabase/server';
import LaunchCountdown from '@/components/shared/launch-countdown';
export const dynamic = 'force-dynamic';
async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_admin');
  return Boolean(data);
}
export default async function LanzamientosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const admin = await isAdmin();
  if (!admin) return <div role="alert">403 forbidden is_admin launches lanzar</div>;
  const supabase = await createClient();
  const { data } = await supabase.from('launches').select('id,title,launch_date,status,type,teaser_image').order('launch_date', { ascending: true }).limit(100);
  const launches = (data ?? []) as { id: string; title: string; launch_date: string; status: string; type: string; teaser_image: string | null }[];
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Lanzamientos launches admin</h1>
      <p className="mt-2 text-sm text-zinc-600">calendar scheduled live ended drop collection restock</p>
      <div className="mt-6 grid gap-4">
        {launches.map((l) => (
          <div key={l.id} className="rounded border p-4" style={{ minHeight: 44 }}>
            <div className="font-medium">{l.title}</div>
            <div className="text-sm text-zinc-600">{l.type} {l.status}</div>
            <LaunchCountdown launchDate={l.launch_date} locale={locale} />
          </div>
        ))}
      </div>
    </main>
  );
}
