export type ShareEntity = 'product' | 'cultura' | 'wishlist' | 'review' | 'cart';
export function canWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof (navigator as unknown as { share?: unknown }).share === 'function';
}
export function buildShareUrls({ url, text }: { url: string; text: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    x: `https://x.com/intent/tweet?text=${t}&url=${u}`,
    twitter: `https://x.com/intent/tweet?text=${t}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    tiktok: `https://www.tiktok.com/share?url=${u}`,
    instagram: `https://www.instagram.com/?url=${u}`,
  };
}
export function getOgImageUrl(entity: ShareEntity, id: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  return `${base}/api/og?entity=${entity}&id=${id}`;
}
export async function copyLink(url: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {}
  return false;
}
export function getShareText(locale: string, entity: ShareEntity): string {
  const map: Record<string, Record<ShareEntity, string>> = {
    'es-AR': { product: 'Mira este producto', cultura: 'Lee este articulo', wishlist: 'Mi lista deseada', review: 'Mira esta resena', cart: 'Mi carrito' },
    en: { product: 'Check this product', cultura: 'Read this article', wishlist: 'My wishlist', review: 'Check this review', cart: 'My cart' },
    fr: { product: 'Decouvrez ce produit', cultura: 'Lisez cet article', wishlist: 'Ma liste', review: 'Voir cet avis', cart: 'Mon panier' },
    'pt-BR': { product: 'Veja este produto', cultura: 'Leia este artigo', wishlist: 'Minha lista', review: 'Veja esta avaliacao', cart: 'Meu carrinho' },
  };
  const es = (map['es-AR'] as Record<ShareEntity, string>)[entity];
  return (map[locale] as Record<ShareEntity, string> | undefined)?.[entity] ?? es ?? textFallback(entity);
}
function textFallback(e: ShareEntity) {
  return e;
}
export const OG = 'og:image open graph';
export const WEB_SHARE = 'Web Share navigator.share canShare';
