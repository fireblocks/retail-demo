import React from "react";
import { WalletCard } from "./WalletCard";
import { Asset } from "@/lib/types";

export function AssetsCards({ assets }: { assets: Asset[] }) {
  return (
    <div className="flex flex-wrap gap-4 justify-start">
      {assets.map((asset: Asset) => (
        <WalletCard key={asset.assetId} {...asset} />
      ))}
    </div>
  );
}