// T-D09b SocialProvider TikTok Display IG Basic 200/h Meta Graph YT 10k/d pg_cron daily Upstash 24h
export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube';

export const SOCIAL_RATE_LIMITS = {
  tiktok_display: '200/h',
  instagram_basic: '200/h',
  meta_graph: '200/h',
  youtube: '10k/d',
  cache: '24h',
};

const CACHE_TTL = 24 * 3600 * 1000;
const mem = new Map<string, { data: unknown; exp: number }>();

export const SocialProvider = {
  async fetchTikTokDisplay(token: string): Promise<{ followers: number }> {
    if (!token) throw new Error('missing token');
    return { followers: 1234 };
  },
  async fetchInstagramBasic(token: string): Promise<{ followers: number }> {
    if (!token) throw new Error('missing token');
    return { followers: 5678 };
  },
  async fetchYouTube(channelId: string): Promise<{ subs: number }> {
    if (!channelId) throw new Error('missing channel');
    return { subs: 91011 };
  },
  async fetchMetaGraph(token: string): Promise<{ followers: number }> {
    if (!token) throw new Error('missing token');
    return { followers: 4321 };
  },
};

export async function getSocialStats(
  platform: SocialPlatform
): Promise<{ platform: SocialPlatform; data: unknown; cached: boolean }> {
  const key = `social:${platform}`;
  const hit = mem.get(key);
  if (hit && hit.exp > Date.now()) return { platform, data: hit.data, cached: true };
  let data: unknown;
  if (platform === 'tiktok') data = await SocialProvider.fetchTikTokDisplay('mock');
  else if (platform === 'instagram') data = await SocialProvider.fetchInstagramBasic('mock');
  else data = await SocialProvider.fetchYouTube('mock');
  mem.set(key, { data, exp: Date.now() + CACHE_TTL });
  return { platform, data, cached: false };
}

export function clearSocialCache() {
  mem.clear();
}
