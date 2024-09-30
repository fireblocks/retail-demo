import { Asset } from '@model/Asset';
import { Wallet } from '@model/Wallet';
import { vaultService } from '@service';
import { VaultAccount } from '@model/VaultAccount';
import { createLogger } from '@util/logger.utils';
import { vaultConfig } from '@util/vaultConfig';

const logger = createLogger('<Asset Service>');

class AssetService {
  public async updateIncomingBalance(data: any, wallet: Wallet) {
    let amountToUpdate = parseFloat(data.amountInfo.amount);
    logger.info(`Asset Service: The amount to update is: ${amountToUpdate}`);

    const asset = await Asset.findOne({
      where: { address: data.destinationAddress },
      relations: ['vaultAccount'],
    });

    if (asset) {
      asset.balance = Number(asset.balance) + amountToUpdate;
      asset.save();
      logger.info(
        `Asset Service: Successfully updated asset balance for wallet: ${wallet.id}, asset: ${asset.assetId}, fireblocksVaultAccount: ${asset.vaultAccount.fireblocksVaultId}`
      );
    } else {
      throw new Error(`wallet not found`);
    }
    return true;
  }

  public async updateSweepingBalance(data: any) {
    const vaultAccount = await vaultService.getVaultAccountForFireblocksVaultId(
      data.source.id
    );
    const omnibusVaultAccount =
      await vaultService.getVaultAccountForFireblocksVaultId(vaultConfig.getOmnibusVaultId());

    const asset = await Asset.findOne({
      where: {
        vaultAccount: vaultAccount as VaultAccount,
        assetId: data.assetId,
      },
    });

    const omnibusAsset = await Asset.findOne({
      where: {
        vaultAccount: omnibusVaultAccount as VaultAccount,
        assetId: data.assetId,
      },
    });
    omnibusAsset.balance =
      Number(omnibusAsset.balance) + Number(data.amountInfo.amount);
    asset.balance = 0;
    this.updateIsSwept(true, data.source.id, data.assetId);
    asset.save();
  }

  public async updateIsSwept(
    isSwept: boolean,
    fireblocksVaultAccountId: string,
    assetId: string
  ) {
    logger.info(`In update isSwept. Going to change Fireblocks vault account id: ${fireblocksVaultAccountId} to isSwept: ${isSwept}`)
    const vaultAccount = await vaultService.getVaultAccountForFireblocksVaultId(
      fireblocksVaultAccountId
    );
    const asset = await Asset.findOne({
      where: { vaultAccount: vaultAccount as VaultAccount, assetId },
    });

    asset.isSwept = isSwept;
    asset.save()
  }
}

export const assetService = new AssetService();
