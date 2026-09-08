import Decimal from 'decimal.js';

type RoundingMode = Decimal.Rounding;

function narrowRoundingMode(mode: number): RoundingMode {
  if (Number.isInteger(mode) && mode >= 0 && mode <= 8) return mode as RoundingMode;
  return Decimal.ROUND_HALF_UP;
}
export function toDecimalCents(value: number, mode: number = Decimal.ROUND_HALF_UP): number {
  return new Decimal(value).toDecimalPlaces(0, narrowRoundingMode(mode)).toNumber();
}
export { Decimal };
