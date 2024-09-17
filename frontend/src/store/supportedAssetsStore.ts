import { SUPPORTED_ASSETS } from "@/lib/constants";
import axios from "axios";
import { makeAutoObservable } from "mobx";


interface SupportedAsset {
  assetId: string,
  logoUrl: string,
  explorerUrl: string
}

class SupportedAssetStore {
  assets: SupportedAsset[] = [];


  constructor() {
    makeAutoObservable(this);
  }

  private setAssets(assets: SupportedAsset[]) {
    this.assets = assets 
  }
  
  async getSupportedAssetsFromDb() {
    const res = await axios.get(SUPPORTED_ASSETS, { withCredentials: true})
    this.setAssets(res.data)
  }

  getSupportedAssets() {
    return this.assets;
  }

}

const assetStore = new SupportedAssetStore();
export default assetStore;