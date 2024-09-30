import assetStore from "@/store/supportedAssetsStore";

export const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    
    const formatted = num.toString().replace(/\.?0+$/, "");
    
    return formatted.includes('.') ? formatted : num.toFixed(0);
  };

export const parseDate = (dateString: string | number): Date => {
  if (typeof dateString === 'string') {
    const unixTimestamp = parseInt(dateString, 10);
    if (!isNaN(unixTimestamp)) {
      return new Date(unixTimestamp * (unixTimestamp > 1e12 ? 1 : 1000));
    } 
    return new Date(dateString);
  }
  return new Date(dateString);
};




export function getAssetNameById(assetId: string): string | undefined {
  const asset = assetStore.getAssetById(assetId);
  return asset ? asset.name : undefined;
}

export function getAssetIdByName(name: string): string | undefined {
  const asset = assetStore.getAssetByName(name);
  return asset ? asset.fireblocksAssetId : undefined;
}