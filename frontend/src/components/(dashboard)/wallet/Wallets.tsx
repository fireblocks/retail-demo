import React from "react";
import { AssetsCards } from "./AssetsCard";
import { Asset } from "@/lib/types";

interface WalletsProps {
  assets: Asset[];
}

export function Wallets({ assets }: WalletsProps) {
  return (
    <div>
      <AssetsCards assets={assets} />
    </div>
  );
}
