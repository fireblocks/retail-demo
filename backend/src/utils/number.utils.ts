export function formatBalance(balance: number | string, decimalPlaces: number = 8): string {
  return Number(balance).toFixed(decimalPlaces);
}