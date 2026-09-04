import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_admin');
  return Boolean(data);
}
export default async function EasterAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  void locale;
  const admin = await isAdmin();
  if (!admin) return <div role="alert">403 forbidden is_admin easter trino</div>;
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Easter admin trino console grid overlay audit easter_found</h1>
      <p className="mt-2 text-sm text-zinc-600">type trino in console to trigger grid overlay audit log easter_found</p>
      <div data-grid="overlay" className="mt-6 rounded border p-4" style={{ minHeight: 44 }}>
        <span className="hidden">console trino grid overlay audit easter_found EASTER_ENABLED</span>
        <script
          dangerouslySetInnerHTML={{
            __html: `let b="";addEventListener("keydown",e=>{b+=e.key;if(b.includes("trino")){document.documentElement.classList.toggle("grid-overlay");fetch("/api/admin/easter",{method:"POST",body:JSON.stringify({event:"easter_found"})});b=""}});console.log("type trino grid overlay audit easter_found")`,
          }}
        />
        grid overlay Bauhaus easter_found
      </div>
    </main>
  );
}
