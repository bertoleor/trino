import { SocialProvider } from '@/lib/social/graph';

type SyncItem = { id: string; platform: 'tiktok' | 'instagram'; url: string; caption: string; hash: string };

const seen = new Set<string>();

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h);
}

export async function syncCulturaFromSocial(): Promise<{ imported: number; items: SyncItem[] }> {
  const t = await SocialProvider.fetchTikTokDisplay('mock').catch(() => ({ followers: 0 }));
  const ig = await SocialProvider.fetchInstagramBasic('mock').catch(() => ({ followers: 0 }));
  void t;
  void ig;
  const raw: SyncItem[] = [
    { id: 't1', platform: 'tiktok', url: 'https://tiktok.com/@santisima/video/1', caption: 'Ritual TikTok', hash: hash('t1') },
    { id: 'ig1', platform: 'instagram', url: 'https://instagram.com/p/1', caption: 'Ritual IG', hash: hash('ig1') },
  ];
  const filtered = raw.filter((r) => {
    if (seen.has(r.hash)) return false;
    seen.add(r.hash);
    return true;
  });
  return { imported: filtered.length, items: filtered };
}

export function clearSyncDedup() {
  seen.clear();
}
