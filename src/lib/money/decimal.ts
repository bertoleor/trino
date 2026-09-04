import Decimal from 'decimal.js';
export function toDecimalCents(value: number, mode: number = Decimal.ROUND_HALF_UP): number {
  return new Decimal(value).toDecimalPlaces(0, mode as unknown as never).toNumber();
}
export { Decimal };
