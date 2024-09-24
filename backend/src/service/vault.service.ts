import { VaultAccount } from '@model/VaultAccount';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Vault Service>');

class VaultService {
  public getVaultAccountForFireblocksVaultId = async (
    fireblocksVaultAccountId: string
  ) => {
    logger.info(
      `Getting vault account for Fireblocks VA ID: ${fireblocksVaultAccountId}`
    );

    const vaultAccount = await VaultAccount.findOne({
      where: { fireblocksVaultId: fireblocksVaultAccountId },
    });

    if (!vaultAccount) {
      logger.info(
        `No vault account was found for vaultAccountId: ${fireblocksVaultAccountId}`
      );
      return '';
    }
    return vaultAccount;
  };
}

export const vaultService = new VaultService();
