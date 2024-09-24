import { walletService, walletAssetService } from '@service';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Webhook Service>');

class WebhookService {
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
    logger.info(
      `New incoming transfer - updating balance for wallet:
      ${walletId}`
    );
    await walletAssetService.updateAssetBalance(
      walletId,
      assetId,
      amountInfo.netAmount
    );
    return true;
  }
}

export const webhookService = new WebhookService();
