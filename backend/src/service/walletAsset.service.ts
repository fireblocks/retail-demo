import { Wallet } from '@model/Wallet';
import { WalletAssetBalance } from '@model/WalletAssetBalance';

export class WalletAssetService {
  async updateAssetBalance(
    wallet: Wallet,
    assetId: string,
    amount: number
  ): Promise<void> {
    console.log("In WalletAssetService: updateAssetBalance() with amount:", amount)
    let walletAssetBalance = await WalletAssetBalance.findOne({
      where: { wallet: { id: wallet.id }, assetId },
    });

    if (!walletAssetBalance) {
      console.log("Wallet Asset Balance does not exist - creating")
      walletAssetBalance = WalletAssetBalance.create({
        wallet,
        assetId,
        totalBalance: amount,
      });
    } else {
      console.log("Wallet Asset Balance found - updating balance.")
      walletAssetBalance.totalBalance = Number(walletAssetBalance.totalBalance) + Number(amount);
    }
    await walletAssetBalance.save();
  }

  public async updatePendingBalance(
    data: any,
    updateType: any,
    wallet: Wallet,
  ) {
    console.log("In WalletAssetService: updatePendingBalance() with amount:", parseFloat(data.amountInfo.amount))
    let amountToUpdate = parseFloat(data.amountInfo.amount);
    const walletAsset = await WalletAssetBalance.findOne({
      where: { wallet }
    })
    
    if (walletAsset) {
      console.log(
        `New ${updateType} transfer created - updating pending balance for wallet: ${wallet.id}. Pending balance change ${amountToUpdate}`
      );
        
      updateType === 'incoming'
        ? (walletAsset.incomingPendingBalance =
          Number(walletAsset.incomingPendingBalance) + amountToUpdate)
        : (walletAsset.outgoingPendingBalance =
          Number(walletAsset.outgoingPendingBalance) + amountToUpdate);

      walletAsset.save();
      return true;
    } else {
      throw new Error(`wallet not found`);
    }
  }
}
