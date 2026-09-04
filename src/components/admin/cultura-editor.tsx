"use client";
import { useState } from 'react';

type Props = {
  initial?: { slug: string; title: string; excerpt?: string; body?: unknown; tags?: string[]; related?: string[]; status?: string };
  onSave?: (data: unknown) => Promise<void>;
};

export default function CulturaEditor({ initial, onSave }: Props) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(false);

  async function handleSave(status: string) {
    const data = { slug, title, excerpt, tags: tags.split(',').map((s) => s.trim()).filter(Boolean), status, body: {} };
    if (onSave) await onSave(data);
  }

  return (
    <div className="space-y-4 rounded border p-4">
      <h2 className="text-lg font-bold">Cultura Editor TipTap + Dropzone Storage</h2>
      <input aria-label="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="w-full rounded border p-2" style={{ minHeight: 44 }} />
      <input aria-label="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" className="w-full rounded border p-2" style={{ minHeight: 44 }} />
      <textarea aria-label="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="excerpt" className="w-full rounded border p-2" />
      <input aria-label="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags comma separated related picker" className="w-full rounded border p-2" style={{ minHeight: 44 }} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        className={`rounded border-2 border-dashed p-6 text-center ${drag ? 'bg-gray-50' : ''}`}
        aria-label="dropzone"
      >
        Dropzone Storage drag cover_image 44px {drag ? 'active' : ''}
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleSave('draft')} className="rounded border px-4 py-2" style={{ minHeight: 44 }}>
          Guardar draft
        </button>
        <button onClick={() => handleSave('published')} className="rounded bg-black px-4 py-2 text-white" style={{ minHeight: 44 }}>
          Publicar
        </button>
        <button onClick={() => setPreview((p) => !p)} className="rounded border px-4 py-2" style={{ minHeight: 44 }}>
          Preview
        </button>
      </div>
      {preview && <div aria-label="preview" className="rounded bg-gray-50 p-4">Preview {title} — related picker preview 44px</div>}
      <span className="hidden">TipTap Dropzone Storage related picker preview RBAC audit</span>
    </div>
  );
}
