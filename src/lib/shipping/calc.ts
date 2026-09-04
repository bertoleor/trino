import { getShippingRates, type ShippingItem } from '@/lib/shipping';

export async function calcShipping(postalCode: string, items: ShippingItem[], sessionId: string) {
  return getShippingRates({ sessionId, postalCode, items });
}
