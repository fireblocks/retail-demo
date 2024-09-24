export const utxoAssets = ['BTC', 'BTC_TEST'];

export function isUTXO(assetId: string): boolean {
  return utxoAssets.includes(assetId) ? true : false;
}
