import { VaultAccountService } from './fireblocks/vaultAccount.service';
import { FireblocksTransactionService } from './fireblocks/transaction.service';
import { Asset } from '@model/Asset';
import { VaultAccount } from '@model/VaultAccount';
import { TransactionRequest, TransferPeerPathType } from '@fireblocks/ts-sdk';

/** Interval for sweeping process in milliseconds (5 minutes) */
const SWEEP_INTERVAL = 5 * 60 * 1000;

/** Minimum balances required for sweeping each asset */
const MINIMUM_BALANCES = {
  ETH_TEST5: 0.01,
  SOL_TEST: 0.1
};

/**
 * Service responsible for managing the sweeping process of assets
 */
export class SweepingService {
  private vaultAccountService: VaultAccountService;
  private fireblocksTransactionService: FireblocksTransactionService;

  /**
   * Initializes a new instance of the SweepingService
   */
  constructor() {
    this.vaultAccountService = new VaultAccountService();
    this.fireblocksTransactionService = new FireblocksTransactionService();
  }

  /**
   * Initiates the sweeping process at regular intervals
   */
  public async initiateSweeping(): Promise<void> {
    setInterval(async () => {
      try {
        await this.performSweep();
      } catch (error) {
        console.error('Error during sweeping:', error);
      }
    }, SWEEP_INTERVAL);
  }

  /**
   * Performs the sweeping process
   * @private
   */
  private async performSweep(): Promise<void> {
    console.log('Starting sweeping process...');

    const assetsToSweep = await this.getAssetsToSweep();
    const vaultAccountMap = this.createVaultAccountMap(assetsToSweep);

    for (const [vaultAccountId, assets] of vaultAccountMap.entries()) {
      for (const asset of assets) {
        const balanceVerified = await this.verifyBalanceWithFireblocks(vaultAccountId, asset);
        if (balanceVerified) {
          await this.createSweepingTransaction(vaultAccountId, asset);
        } else {
          console.log(`Skipping sweep for asset ${asset.assetId} in vault ${vaultAccountId} due to balance mismatch`);
        }
      }
    }

    console.log('Sweeping process completed.');
  }

  /**
   * Retrieves assets that are eligible for sweeping, excluding BTC_TEST
   * @private
   * @returns {Promise<Asset[]>} Array of assets to sweep
   */
  private async getAssetsToSweep(): Promise<Asset[]> {
    const sweepableAssetIds = Object.keys(MINIMUM_BALANCES).filter(assetId => assetId !== 'BTC_TEST');

    const assetsToSweep = await Asset.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.vaultAccount', 'vaultAccount')
      .leftJoinAndSelect('asset.wallet', 'wallet')
      .where('asset.assetId IN (:...assetIds)', { assetIds: sweepableAssetIds })
      .andWhere('asset.balance >= :minBalance', { minBalance: 0 })
      .getMany();

    return assetsToSweep.filter(asset => 
      parseFloat(asset.balance.toString()) >= MINIMUM_BALANCES[asset.assetId]
    );
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

    return vaultAccountMap;
  }

  /**
   * Creates a sweeping transaction for a given vault account and asset
   * @private
   * @param {string} vaultAccountId - ID of the vault account
   * @param {Asset} asset - Asset to sweep
   */
  private async createSweepingTransaction(vaultAccountId: string, asset: Asset): Promise<void> {
    const transactionRequest: TransactionRequest = {
      assetId: asset.assetId,
      amount: asset.balance.toString(),
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: vaultAccountId,
      },
      destination: {
        type: TransferPeerPathType.VaultAccount,
        id: '0',
      },
      feeLevel: "LOW",
      note: 'Automated sweeping transaction',
    };

    try {
      const txId = await this.fireblocksTransactionService.createTransaction(transactionRequest);
      console.log(`Sweeping transaction created for asset ${asset.assetId} from vault ${vaultAccountId} to vault 0. Transaction ID: ${txId}`);
    } catch (error) {
      console.error(`Error creating sweeping transaction for asset ${asset.assetId} from vault ${vaultAccountId}:`, error);
    }
  }

  /**
   * Verifies the balance of an asset with Fireblocks
   * @private
   * @param {string} vaultAccountId - ID of the vault account
   * @param {Asset} asset - Asset to verify
   * @returns {Promise<boolean>} True if balance is verified, false otherwise
   */
  private async verifyBalanceWithFireblocks(vaultAccountId: string, asset: Asset): Promise<boolean> {
    try {
      const fireblocksBalance = await this.vaultAccountService.getVaultWalletBalance(vaultAccountId, asset.assetId);
      const fireblocksBalanceNumber = parseFloat(fireblocksBalance.available);
      const dbBalanceNumber = parseFloat(asset.balance.toString());

      if (Math.abs(fireblocksBalanceNumber - dbBalanceNumber) < 0.000001) { 
        return true;
      } else {
        console.log(`Balance mismatch for asset ${asset.assetId} in vault ${vaultAccountId}. Fireblocks: ${fireblocksBalanceNumber}, DB: ${dbBalanceNumber}`);
        return false;
      }
    } catch (error) {
      console.error(`Error verifying balance with Fireblocks for asset ${asset.assetId} in vault ${vaultAccountId}:`, error);
      return false;
    }
  }
}
