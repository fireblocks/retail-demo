import { Wallet } from '@model/Wallet';
import { WalletAssetBalance } from '@model/WalletAssetBalance';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Wallet Asset Service>');
class WalletAssetService {
  async updateAssetBalance(
    wallet: Wallet,
    assetId: string,
    amount: number
  ): Promise<WalletAssetBalance> {
    logger.info(
      `In WalletAssetService: updateAssetBalance() with amount:${amount}`
    );
    let walletAssetBalance = await WalletAssetBalance.findOne({
      where: { wallet: { id: wallet.id }, assetId },
    });

    if (!walletAssetBalance) {
      logger.info('Wallet Asset Balance does not exist - creating');
      walletAssetBalance = WalletAssetBalance.create({
        wallet,
        assetId,
        totalBalance: amount,
      });
    } else {
      logger.info('Wallet Asset Balance found - updating balance.');
      walletAssetBalance.totalBalance =
        Number(walletAssetBalance.totalBalance) + Number(amount);
    }
    await walletAssetBalance.save();  
    return walletAssetBalance;
  }

  public async updatePendingBalance(
    data: any,
    updateType: any,
    wallet: Wallet
  ) {
    logger.info(
      `In WalletAssetService: updatePendingBalance() with amount:
      ${parseFloat(data.amountInfo.amount)}`
    );
    let amountToUpdate = parseFloat(data.amountInfo.amount);
    const walletAsset = await WalletAssetBalance.findOne({
      where: { wallet },
    });

    if (walletAsset) {
      logger.info(
        `New ${updateType} transfer created - updating pending balance for wallet: ${wallet.id}. Pending balance change ${amountToUpdate}`
      );

      updateType === 'incoming'
        ? (walletAsset.incomingPendingBalance =
            Number(walletAsset.incomingPendingBalance) + amountToUpdate)
        : (walletAsset.outgoingPendingBalance =
            Number(walletAsset.outgoingPendingBalance) + amountToUpdate);

      walletAsset.save();
      return walletAsset;
    } else {
      throw new Error(`wallet not found`);
    }
  }
}

export const walletAssetService = new WalletAssetService();
