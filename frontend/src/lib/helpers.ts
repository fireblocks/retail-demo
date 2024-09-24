import assetStore from "@/store/supportedAssetsStore";

export const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    
    const formatted = num.toString().replace(/\.?0+$/, "");
    
    return formatted.includes('.') ? formatted : num.toFixed(0);
  };

export const parseDate = (dateString: string | number): Date => {
  if (typeof dateString === 'string') {
    // Check if it's a Unix timestamp (seconds or milliseconds)
    const unixTimestamp = parseInt(dateString, 10);
    if (!isNaN(unixTimestamp)) {
      // If it's in seconds, convert to milliseconds
      return new Date(unixTimestamp * (unixTimestamp > 1e12 ? 1 : 1000));
    }
    // If it's not a Unix timestamp, try parsing it as a regular date string
    return new Date(dateString);
  }
  // If it's already a number, assume it's a Unix timestamp in milliseconds
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