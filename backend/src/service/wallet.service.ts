import { Wallet } from '@model/Wallet';
import { VaultAccount } from '@model/VaultAccount';
import { Asset } from '@model/Asset';
import { WalletAssetBalance } from '@model/WalletAssetBalance';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Wallet Service>');

class WalletService {
  public getWalletForVaultAccount = async (vaultAccountId: string) => {
    logger.info(`Getting wallet for vault account ID: ${vaultAccountId}`);

    const vaultAccount = await VaultAccount.findOne({
      where: { fireblocksVaultId: vaultAccountId },
    });

    if (!vaultAccount) {
      logger.info('No vault account was found - returning null');
      return null;
    }

    const asset = await Asset.findOne({
      where: { vaultAccount: vaultAccount },
    });

    const wallet = await Wallet.findOne({
      where: { id: asset.wallet.id },
      relations: ['user'],
    });

    logger.info(`Get wallet for vault account - returning wallet: ${wallet}`);
    return wallet;
  };

  public getWalletForAddress = async (address) => {
    const asset = await Asset.findOne({
      where: { address: address },
      relations: ['wallet', 'wallet.user'],
    });

    return asset.wallet;
  };

  public getWalletAssetBalance = async (walletId: string, assetId: string) => {
    const walletAssetBalance = WalletAssetBalance.findOne({
      where: {
        wallet: { id: walletId },
        assetId,
      },
    });
    return walletAssetBalance;
  };
}

export const walletService = new WalletService();
