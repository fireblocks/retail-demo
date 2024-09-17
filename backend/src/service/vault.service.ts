import { VaultAccount } from '@model/VaultAccount';

export class VaultService {
  public getVaultAccountForFireblocksVaultId = async (
    fireblocksVaultAccountId: string
  ) => {
    console.log(
      'Getting vault account for Fireblocks VA ID:',
      fireblocksVaultAccountId
    );

    const vaultAccount = await VaultAccount.findOne({
      where: { fireblocksVaultId: fireblocksVaultAccountId },
    });

    if (!vaultAccount) {
      console.log(`No vault account was found for vaultAccountId: ${fireblocksVaultAccountId}`);
      return '';
      
    }
    return vaultAccount;
  };
}
