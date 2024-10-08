import { createLogger } from '@util/logger.utils';

const logger = createLogger('<VaultConfig>');

class VaultConfig {
  private static instance: VaultConfig;
  private omnibusVaultId: string | null = null;
  private withdrawalVaultIds: string[] = [];

  private constructor() {}

  public static getInstance(): VaultConfig {
    if (!VaultConfig.instance) {
      VaultConfig.instance = new VaultConfig();
    }
    return VaultConfig.instance;
  }

  public setOmnibusVaultId(id: string): void {
    this.omnibusVaultId = id;
    logger.info(`Set Omnibus Vault ID: ${id}`);
  }

  public getOmnibusVaultId(): string | null {
    return this.omnibusVaultId;
  }

  public setWithdrawalVaultIds(ids: string[]): void {
    this.withdrawalVaultIds = ids;
    logger.info(`Set Withdrawal Vault IDs: ${ids.join(', ')}`);
  }

  public getWithdrawalVaultIds(): string[] {
    return this.withdrawalVaultIds;
  }

  public getRandomWithdrawalVaultId(): string | null {
    if (this.withdrawalVaultIds.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.withdrawalVaultIds.length);
    return this.withdrawalVaultIds[randomIndex];
  }
}

export const vaultConfig = VaultConfig.getInstance();