import {
  fireblocksVaultAccountService,
  fireblocksTransactionService,
} from '@service/fireblocks';
import { Asset } from '@model/Asset';
import { TransactionRequest, TransferPeerPathType } from '@fireblocks/ts-sdk';
import { createLogger } from '@util/logger.utils';
import { vaultConfig } from '@util/vaultConfig';
import { transactionService } from './transaction.service';

const logger = createLogger('<Sweeping Service>');

/** Interval for sweeping process in milliseconds (5 minutes) */
const SWEEP_INTERVAL = 1 * 60 * 1000;

/** Minimum balances required for sweeping each asset */
const MINIMUM_BALANCES = {
  ETH_TEST5: 0.01,
  SOL_TEST: 0.1,
};

/**
 * Service responsible for managing the sweeping process of assets
 */
class SweepingService {
  private omnibusVaultAccountId: string | null = null;
  private withdrawalVaultAccountsIds: string[] = [];

  constructor() {
    this.updateVaultConfig();
  }

  private updateVaultConfig() {
    this.omnibusVaultAccountId = vaultConfig.getOmnibusVaultId();
    this.withdrawalVaultAccountsIds = vaultConfig.getWithdrawalVaultIds();
  }

  /**
   * Initiates the sweeping process at regular intervals
   */
  public async initiateSweeping(): Promise<void> {
    setInterval(async () => {
      try {
        this.updateVaultConfig();
        await this.performSweep();
      } catch (error) {
        logger.error(
          `Error during sweeping: ${error})}`
        );
      }
    }, SWEEP_INTERVAL);
  }

  /**
   * Performs the sweeping process
   * @private
   */
  private async performSweep(): Promise<void> {
    logger.info('Starting sweeping process...');

    const assetsToSweep = await this.getAssetsToSweep();
    const vaultAccountMap = this.createVaultAccountMap(assetsToSweep);

    for (const [vaultAccountId, assets] of vaultAccountMap.entries()) {
      for (const asset of assets) {
        const balanceVerified = await this.verifyBalanceWithFireblocks(
          vaultAccountId,
          asset
        );
        if (balanceVerified) {
          logger.info(`Going to create sweeping tx for asset: ${asset.assetId} from vault account ID: ${vaultAccountId}`)
          await this.createSweepingTransaction(vaultAccountId, asset);
        } else {
          logger.info(
            `Skipping sweep for asset ${asset.assetId} in vault ${vaultAccountId} due to balance mismatch`
          );
        }
      }
    }

    logger.info('Sweeping process completed.');
  }

  /**
   * Retrieves assets that are eligible for sweeping, excluding BTC_TEST
   * @private
   * @returns {Promise<Asset[]>} Array of assets to sweep
   */
  private async getAssetsToSweep(): Promise<Asset[]> {
    const sweepableAssetIds = Object.keys(MINIMUM_BALANCES);
    logger.info(`Sweepable asset IDs: ${JSON.stringify(sweepableAssetIds)}`);
    const excludedVaultIds = [...this.withdrawalVaultAccountsIds, this.omnibusVaultAccountId].filter(id => id != null);

    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.vaultAccount', 'vaultAccount')
      .leftJoinAndSelect('asset.wallet', 'wallet')
      .where('asset.assetId IN (:...assetIds)', { assetIds: sweepableAssetIds })
      .andWhere('asset.balance >= :minBalance', { minBalance: 0 })
      .andWhere('asset.isSwept != :isSwept', { isSwept: true});

    if (excludedVaultIds.length > 0) {
      query.andWhere('vaultAccount.fireblocksVaultId NOT IN (:...excludedVaultIds)', {
        excludedVaultIds: excludedVaultIds,
      });
    }


    const assetsToSweep = await query.getMany();
    const result = assetsToSweep.filter(
      (asset) =>
        parseFloat(asset.balance.toString()) >= MINIMUM_BALANCES[asset.assetId]
    );

    return result;
  }

  /**
   * Creates a map of vault account IDs to their associated assets
   * @private
   * @param {Asset[]} assets - Array of assets to map
   * @returns {Map<string, Asset[]>} Map of vault account IDs to assets
   */
  private createVaultAccountMap(assets: Asset[]): Map<string, Asset[]> {
    const vaultAccountMap = new Map<string, Asset[]>();

    for (const asset of assets) {
      const vaultAccountId = asset.vaultAccount.fireblocksVaultId;
      if (!vaultAccountMap.has(vaultAccountId)) {
        vaultAccountMap.set(vaultAccountId, []);
      }
      vaultAccountMap.get(vaultAccountId).push(asset);
    }

    if(vaultAccountMap.size != 0) {
      logger.info(`Vault Account Map to sweep:\n ${JSON.stringify(Object.fromEntries(vaultAccountMap), null, 2)}`)
    } else {
      logger.info(`There are no assets to sweep.`)
    }
    
    return vaultAccountMap;
  }

  /**
   * Creates a sweeping transaction for a given vault account and asset
   * @private
   * @param {string} vaultAccountId - ID of the vault account
   * @param {Asset} asset - Asset to sweep
   */
  private async createSweepingTransaction(
    vaultAccountId: string,
    asset: Asset
  ): Promise<void> {
    const omnibusVaultAccountId = vaultConfig.getOmnibusVaultId();

    const transactionRequest: TransactionRequest = {
      assetId: asset.assetId,
      amount: asset.balance.toString(),
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: vaultAccountId,
      },
      destination: {
        type: TransferPeerPathType.VaultAccount,
        id: omnibusVaultAccountId,
      },
      feeLevel: 'LOW',
      note: 'Automated sweeping transaction',
    };

    try {
      const txId =
        await fireblocksTransactionService.createTransaction(
          transactionRequest
        );
      logger.info(
        `Sweeping transaction created for asset ${asset.assetId} from vault ${vaultAccountId} to vault 0. Transaction ID: ${txId.id}`
      );
      
      await transactionService.addTransaction({
        fireblocksTxId: txId.id,
        status: txId.status,
        amount: asset.balance.toString(),
        wallet: asset.wallet,
        createdAt: Date.now().toString(),
        assetId: asset.assetId,
        isSweeping: true
      });
      asset.isSwept = true;
      asset.save()
    } catch (error) {
      logger.error(
        `Error creating sweeping transaction for asset ${asset.assetId} from vault ${vaultAccountId}:`,
        error
      );
    }
  }

  /**
   * Verifies the balance of an asset with Fireblocks
   * @private
   * @param {string} vaultAccountId - ID of the vault account
   * @param {Asset} asset - Asset to verify
   * @returns {Promise<boolean>} True if balance is verified, false otherwise
   */
  private async verifyBalanceWithFireblocks(
    vaultAccountId: string,
    asset: Asset
  ): Promise<boolean> {
    try {
      const fireblocksBalance =
        await fireblocksVaultAccountService.getVaultWalletBalance(
          vaultAccountId,
          asset.assetId
        );
      const fireblocksBalanceNumber = parseFloat(fireblocksBalance.available);
      const dbBalanceNumber = parseFloat(asset.balance.toString());

      if (Math.abs(fireblocksBalanceNumber - dbBalanceNumber) < 0.000001) {
        return true;
      } else {
        logger.info(
          `Balance mismatch for asset ${asset.assetId} in vault ${vaultAccountId}. Fireblocks: ${fireblocksBalanceNumber}, DB: ${dbBalanceNumber}`
        );
        return false;
      }
    } catch (error) {
      logger.error(
        `Error verifying balance with Fireblocks for asset ${asset.assetId} in vault ${vaultAccountId}:`,
        error
      );
      return false;
    }
  }
}

export const sweepingService = new SweepingService();
