import { WalletService } from './wallet.service';
import { WalletAssetService } from './walletAsset.service';

const walletService = new WalletService();
const walletAssetService = new WalletAssetService();

export class WebhookService {
  public async updateIncomingBalance(data: any) {
    const txData = data.type.data;
    const {
      source,
      destination,
      amountInfo,
      txHash,
      createdAt,
      blockInfo,
      assetId,
    } = txData;

    const walletId = await walletService.getWalletForVaultAccount(
      destination.id
    );
    console.log(
      'New incoming transfer - updating balance for wallet:',
      walletId
    );
    await walletAssetService.updateAssetBalance(
      walletId,
      assetId,
      amountInfo.netAmount
    );
    return true
  }
}
