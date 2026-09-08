import CulturaCalendar from '@/components/admin/cultura-calendar';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('is_admin');
  return Boolean(data);
}
export default async function CulturaCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await isAdmin();
  if (!admin) return <div role="alert">403 forbidden is_admin cultural calendar</div>;
  const supabase = await createClient();
  const { data } = await supabase
    .from('cultura_posts')
    .select('id, slug, title, status, published_at, locale, tags')
    .order('published_at', { ascending: true })
    .limit(100);
  const posts = (data ?? []) as {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published' | 'scheduled';
    published_at: string | null;
    locale: string;
    tags: string[];
  }[];
  return (
    <main lang={locale} className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">
        Cultura Calendar editorial month/week drag-drop dnd-kit
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        status colors draft/published/scheduled filter locale/tag pg query published_at index
        optimistic update revalidate
      </p>
      <div className="mt-6">
        <CulturaCalendar initialPosts={posts} />
      </div>
    </main>
  );
}
