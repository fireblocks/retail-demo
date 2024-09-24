import { Wallet, Asset } from "@/lib/types";
import apiService from "@/services/api.service";
import { makeAutoObservable } from "mobx";
import terminalStore from "./terminalStore";
import notificationStore from './notificationStore';

interface BackendAsset {
  assetId: string;
  address: string;
  vaultAccountId: string;
}

interface AssetBalance {
  id: string;
  assetId: string;
  totalBalance: string;
  incomingPendingBalance: string;
  outgoingPendingBalance: string;
}

interface BackendResponse {
  assets: BackendAsset[];
  assetBalances: AssetBalance[];
}

interface AggregatedAsset extends Asset {
  assetId: string;
  balance: string;
  addresses: string[];
  pendingIncomingBalance: string;
  pendingOutgoingBalance: string;
}

class WalletStore {
  wallet: Wallet = {
    assets: null,
    id: null,
  };
  walletLoaded = false;
  usdBalance = "0";

  constructor() {
    makeAutoObservable(this);
  }

  setUsdBalance(balance: string) {
    this.usdBalance = balance;
  }
  getAssetBalance(assetId: string): string {
    const asset = this.wallet.assets?.find(a => a.assetId === assetId);
    return asset ? asset.balance : '0';
  }
  setUserAsset(newAsset: any) {
    console.log("In set user asset:", JSON.stringify(newAsset, null, 2))
    if (!newAsset || typeof newAsset !== 'object') {
        console.error("Invalid newAsset:", newAsset);
        return;
    }

    if (!this.wallet.assets) {
        this.wallet.assets = [];
    }

    const existingAssetIndex = this.wallet.assets.findIndex(
        (asset) => asset.assetId === newAsset.assetId
    );

    if (existingAssetIndex >= 0) {
        const existingAsset = this.wallet.assets[existingAssetIndex];

        if (existingAsset.balance != null && newAsset.balance != null) {
            existingAsset.balance = (
                parseFloat(existingAsset.balance.toString()) +
                parseFloat(newAsset.balance.toString())
            ).toString();
        }

        // Ensure addresses array exists
        if (!existingAsset.addresses) {
            existingAsset.addresses = [];
        }

        // Add new address if it doesn't already exist
        if (newAsset.address && !existingAsset.addresses.includes(newAsset.address)) {
            existingAsset.addresses.push(newAsset.address);
        }

        // Replace the asset with the updated one
        this.wallet.assets[existingAssetIndex] = existingAsset;
    } else {
        // If the asset doesn't exist, add it to the list
        this.wallet.assets.push({
            assetId: newAsset.assetId,
            balance: newAsset.balance,
            addresses: newAsset.address ? [newAsset.address] : [],
            pendingIncomingBalance: "0",
            pendingOutgoingBalance: "0"
        });
    }

    this.wallet.assets = [...this.wallet.assets];

    console.log("After setting the user asset:", this.wallet.assets);
}

  setUserWallet(userWallet: any) {
    const message = `${new Date().toISOString()}: This user has the following wallet: ${userWallet.id}. There are ${userWallet.assets?.length} assets/addresses in this wallet. Each user has only 1 wallet! Each wallet can have multiple assets and addresses. These are created in the same/different vault account in Fireblocks - depending on the asset type.` 
    terminalStore.addLog(message)
    
    this.wallet = {
      id: userWallet.id,
      assets: this.aggregateAssets(userWallet)
    };
  }

  private aggregateAssets(wallet: BackendResponse): AggregatedAsset[] {
    const aggregatedAssets: { [key: string]: AggregatedAsset } = {};

  
    wallet.assets.forEach(asset => {
      if (aggregatedAssets[asset.assetId]) {
        aggregatedAssets[asset.assetId].addresses?.push(asset.address);
      } else {
        aggregatedAssets[asset.assetId] = {
          assetId: asset.assetId,
          balance: '0',
          addresses: asset.address ? [asset.address] : [],
          pendingOutgoingBalance: '0',
          pendingIncomingBalance: '0'
        };
      }
    });

    // Then, add balance information from the assetBalances array
    wallet.assetBalances.forEach(balance => {
      if (aggregatedAssets[balance.assetId]) {
        aggregatedAssets[balance.assetId].balance = balance.totalBalance;
        aggregatedAssets[balance.assetId].pendingOutgoingBalance = balance.outgoingPendingBalance;
        aggregatedAssets[balance.assetId].pendingIncomingBalance = balance.incomingPendingBalance;
      } else {
        // This case should not happen if the backend is consistent, but we'll handle it just in case
        aggregatedAssets[balance.assetId] = {
          assetId: balance.assetId,
          balance: balance.totalBalance,
          addresses: [],
          pendingOutgoingBalance: balance.outgoingPendingBalance,
          pendingIncomingBalance: balance.incomingPendingBalance
        };
      }
    });

    return Object.values(aggregatedAssets);
  }

  getUserWallet() {
    return this.wallet;
  }

  async fetchUserWallet() {
    let wallet = await apiService.getWallet();
    if (wallet.length == 0) {
      wallet = await apiService.createUserWallet();
      console.log("Going to set a new user wallet:", wallet);
    }
    this.setUserWallet(wallet[0]);
    return wallet[0];
  }

  async fetchWalletAssets(walletId: string) {
    const assets = await apiService.getWalletAssets(walletId);
    this.setUserAsset(assets);
    this.walletLoaded = true;
  }

  async createWalletAsset(walletId: string | null, assetId: string) {
    console.log("In create wallet asset method");
    if (walletId) {
      try {
        const response = await apiService.createWalletAsset(walletId, assetId);
        const newAsset = response?.data;

        if (newAsset && newAsset.assetId) {
          this.setUserAsset(newAsset);
          notificationStore.addNotification(
            "New Asset Created",
            `${assetId} created successfully.`
          );
        }

        return response?.data;
      } catch (error) {
        console.error("Failed to create a new asset:", error);
        notificationStore.addNotification(
          "Asset Creation Failed",
          `Failed to create asset ${assetId}.`
        );
      }
    }
  }

  async fetchFullWalletData() {
    try {
      const wallet = await this.fetchUserWallet();
      await this.fetchWalletAssets(wallet[0].id);
    } catch (error) {
      console.error("Error fetching full wallet data:", error);
    }
  }

  updateBalance(assetId: string, amount: number | string) {
    console.log(`Updating balance for ${assetId} with amount:`, amount)
    if (this.wallet.assets) {
      const asset = this.wallet.assets.find(a => a.assetId === assetId);
      if (asset) {
        const currentBalance = parseFloat(asset.balance || '0');
        const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(currentBalance) || isNaN(amountNumber)) {
          console.error(`Invalid balance update for ${assetId}. Current balance: ${asset.balance}, Amount: ${amount}`);
          return;
        }

        const newBalance = (currentBalance + amountNumber).toFixed(8);
        console.log(`Balance update for ${assetId}: ${currentBalance} + ${amountNumber} = ${newBalance}`);
        asset.balance = newBalance;
        this.wallet.assets = [...this.wallet.assets];
      }
    }
  }

  updateIncomingBalance(assetId: string, amount: number) {
    if (this.wallet.assets) {
      const asset = this.wallet.assets.find(a => a.assetId === assetId);
      if(asset) {
        asset.pendingIncomingBalance = String(amount)
      }
    }
  }

  updateOutgoingBalance(assetId: string, amount: number) {
    if (this.wallet.assets) {
      const asset = this.wallet.assets.find(a => a.assetId === assetId);
      if(asset) {
        asset.pendingOutgoingBalance = String(amount)
        asset.balance = String(parseFloat(asset.balance) - amount)
      }
    }
  }

  addAddress(assetId: string, address: string) {
    if (this.wallet.assets) {
      const asset = this.wallet.assets.find(a => a.assetId === assetId);
      if (asset) {
        if (!asset.addresses) {
          asset.addresses = [];
        }
        if (!asset.addresses.includes(address)) {
          asset.addresses.push(address);
          
          this.wallet.assets = [...this.wallet.assets];
        }
      }
    }
  }

  getTotalBalance(): number {
    if (!this.wallet.assets) {
      return 0;
    }

    return this.wallet.assets.reduce((total, asset) => {
      const balance = parseFloat(asset.balance || '0');
      return total + (isNaN(balance) ? 0 : balance);
    }, 0);
  }
}

const walletStore = new WalletStore();
export default walletStore;
