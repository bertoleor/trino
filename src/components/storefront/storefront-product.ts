export interface PricedProduct {
  price: number;
  price_cents: number | null;
}

export interface StorefrontProductCardData extends PricedProduct {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sale_price_cents: number | null;
}

export interface StorefrontProductDetail extends StorefrontProductCardData {
  description: string | null;
  shade: string | null;
}

export function priceInCents(product: PricedProduct) {
  return product.price_cents ?? Math.round(Number(product.price) * 100);
}
