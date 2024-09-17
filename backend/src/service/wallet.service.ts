import { Wallet } from '@model/Wallet';
import { VaultAccount } from '@model/VaultAccount';
import { Asset } from '@model/Asset';
import { WalletAssetBalance } from '@model/WalletAssetBalance';

export class WalletService {
  public getWalletForVaultAccount = async (vaultAccountId: string) => {
    console.log('Getting wallet for vault account ID:', vaultAccountId);

    const vaultAccount = await VaultAccount.findOne({
      where: { fireblocksVaultId: vaultAccountId },
    });

    if (!vaultAccount) {
      console.log('No vault account was found - returning null');
      return null; 
    }

    const asset = await Asset.findOne({
      where: { vaultAccount: vaultAccount },
    });

    const wallet = await Wallet.findOne({
      where: { id: asset.wallet.id },
      relations: ['user'],
    });

    console.log('Get wallet for vault account - returning wallet:', wallet);
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
