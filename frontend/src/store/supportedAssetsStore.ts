import { SUPPORTED_ASSETS } from "@/lib/constants";
import axios from "axios";
import { makeAutoObservable } from "mobx";

interface SupportedAsset {
  id: string;
  fireblocksAssetId: string;
  explorerUrl: string;
  name: string;
}

class SupportedAssetStore {
  assets: SupportedAsset[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  private setAssets(assets: SupportedAsset[]) {
    this.assets = assets;
  }

  async getSupportedAssetsFromDb() {
    const res = await axios.get(SUPPORTED_ASSETS, { withCredentials: true });
    console.log("Got supported assets from BE:", res.data)
    this.setAssets(res.data);
  }

  getSupportedAssets() {
    return this.assets;
  }

  getAssetById(assetId: string): SupportedAsset | undefined {
    return this.assets.find(asset => asset.fireblocksAssetId === assetId);
  }

  getAssetByName(name: string): SupportedAsset | undefined {
    return this.assets.find(asset => asset.name === name);
  }
}

const assetStore = new SupportedAssetStore();
export default assetStore;