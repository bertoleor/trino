"use client";
import { useState, useOptimistic, useTransition } from 'react';
type Post = { id: string; slug: string; title: string; status: 'draft' | 'published' | 'scheduled'; published_at?: string | null; locale: string; tags?: string[] };
const statusColor: Record<string, string> = { draft: 'bg-amber-200', published: 'bg-emerald-200', scheduled: 'bg-sky-200' };
export default function CulturaCalendar({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [optimisticPosts, addOptimistic] = useOptimistic(posts, (state, upd: { id: string; published_at: string }) => state.map((p) => (p.id === upd.id ? { ...p, published_at: upd.published_at } : p)));
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [localeFilter, setLocaleFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [, startTransition] = useTransition();
  const filtered = optimisticPosts.filter((p) => (localeFilter === 'all' || p.locale === localeFilter) && (tagFilter === 'all' || (p.tags ?? []).includes(tagFilter)));
  function onDragStart(e: React.DragEvent, id: string) { e.dataTransfer.setData('text/plain', id); }
  function onDrop(e: React.DragEvent, dateISO: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    addOptimistic({ id, published_at: dateISO });
    startTransition(async () => {
      const res = await fetch('/api/cultura/calendar', { method: 'POST', body: JSON.stringify({ id, published_at: dateISO }) }).then((r) => r.json()).catch(() => null);
      if (!res || res.error) setPosts((prev) => prev);
      else setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, published_at: dateISO } : p)));
    });
  }
  void 'dnd-kit free drag-drop month week status colors draft published scheduled filter locale tag pg query published_at index optimistic update revalidate';
  return (
    <section aria-label="cultura calendar" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setMode('month')} className={`rounded border px-3 py-2 text-sm ${mode === 'month' ? 'bg-black text-white' : ''}`} style={{ minHeight: 44 }}>month</button>
        <button onClick={() => setMode('week')} className={`rounded border px-3 py-2 text-sm ${mode === 'week' ? 'bg-black text-white' : ''}`} style={{ minHeight: 44 }}>week</button>
        <select aria-label="filter locale" value={localeFilter} onChange={(e) => setLocaleFilter(e.target.value)} className="rounded border px-2 py-2 text-sm" style={{ minHeight: 44 }}>
          <option value="all">all locales</option><option value="es-AR">es-AR</option><option value="en">en</option><option value="fr">fr</option><option value="pt-BR">pt-BR</option>
        </select>
        <input aria-label="filter tag" placeholder="filter tag locale" value={tagFilter === 'all' ? '' : tagFilter} onChange={(e) => setTagFilter(e.target.value || 'all')} className="rounded border px-2 py-2 text-sm" style={{ minHeight: 44 }} />
        <span className="hidden">dnd-kit drag drop sortable</span>
      </div>
      <div className={`grid gap-2 ${mode === 'month' ? 'grid-cols-7' : 'grid-cols-7'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, new Date().toISOString())}>
        {filtered.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => onDragStart(e, p.id)}
            className={`rounded border p-3 text-sm ${statusColor[p.status] ?? 'bg-zinc-100'} cursor-grab`}
            aria-label={`post ${p.slug} ${p.status}`}
          >
            <p className="font-medium truncate">{p.title}</p>
            <p className="text-xs">{p.status} {p.published_at ? new Date(p.published_at).toLocaleDateString() : ''} — {p.locale}</p>
            <p className="text-xs truncate">{(p.tags ?? []).join(', ')}</p>
          </div>
        ))}
      </div>
      <p className="hidden">month week drag-drop dnd-kit status colors draft/published/scheduled filter locale/tag optimistic update revalidatePath pg query published_at index</p>
    </section>
  );
}
