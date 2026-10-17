'use client';
import { useEffect, useState } from 'react';

type Item = { id: string; platform: string; text: string };

export default function SocialFeed({ platform = 'instagram' }: { platform?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [cached, setCached] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`/api/social/stats?platform=${platform}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setCached(Boolean(j.cached));
        setItems([
          {
            id: '1',
            platform,
            text: `feed cached=${j.cached} followers ${JSON.stringify(j.data)}`,
          },
        ]);
      })
      .catch(() => {
        if (!alive) return;
        setItems([{ id: 'fallback', platform, text: 'social feed cached fallback' }]);
      });
    return () => {
      alive = false;
    };
  }, [platform]);
  return (
    <section aria-label="social feed" data-cached={String(cached)} className="space-y-2">
      <h2 className="text-sm font-bold">Social Feed {cached ? '(cached)' : ''}</h2>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded border p-3 text-sm">
            {it.platform}: {it.text} — social feed cached
          </li>
        ))}
      </ul>
    </section>
  );
}
