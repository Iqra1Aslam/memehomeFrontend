export function convertToFloat(value: number, decimals: number): number {
  return value / Math.pow(10, decimals);
}

export function convertFromFloat(value: number, decimals: number): number {
  return value * Math.pow(10, decimals);
}
