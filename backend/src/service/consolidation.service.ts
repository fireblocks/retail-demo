import { SupportedAsset } from '@model/SupportedAsset';
import {
  fireblocksVaultAccountService,
  fireblocksTransactionService,
} from '@service/fireblocks';
import { transactionService } from '@service';
import { utxoAssets } from '@util/utxo.utils';
import { createLogger } from '@util/logger.utils';
require('dotenv').config();

const logger = createLogger('<UTXO consolidation Service>');

/**
 * Service responsible for managing the utxo asset consolidation process
 * @param assetId - asset to consolidate (UTXO Only)
 */
class ConsolidationService {
  public async updateUtxoDepositsCounter(assetId: string): Promise<void> {
    try {
      const supportedAsset = await SupportedAsset.findOne({
        where: { fireblocksAssetId: assetId },
      });
      let counter = supportedAsset.depositsCounter + 1;
      if (counter === 249) {
        logger.info(
          `Reached 249 deposits for ${assetId}, creating consolidation tx`
        );
        const omniVaultAccountId = process.env.OMNIBUS_VAULT;
        await this.consolidateUtxoDeposits(assetId, omniVaultAccountId);
        counter = 0;
      }
      supportedAsset.depositsCounter = counter;
      supportedAsset.save();
    } catch (error) {
      logger.error(
        `Error while updating UTXS deposits counter for ${assetId}, error: ${error}`
      );
    }
  }

  private async clearUtxoDepositsCounter(assetId: string): Promise<void> {
    try {
      const supportedAsset = await SupportedAsset.findOne({
        where: { fireblocksAssetId: assetId },
      });
      supportedAsset.depositsCounter = 0;
      supportedAsset.save();
    } catch (error) {
      logger.error(
        `Error while clearing the UTXO deposits counter for asset: ${assetId}, error: ${error}`
      );
    }
  }
  /**
   * A method to consolidate inputs after 249 users deposits done to a utxo wallet on omnibus vault account
   * @param assetId - asset to consolidate (UTXO Only)
   * @param fireblocksVaultAccountId - Fireblocks deposit omnibus vault account ID
   */
  public async consolidateUtxoDeposits(
    assetId: string,
    fireblocksVaultAccountId: string
  ): Promise<void> {
    try {
      logger.info(`Consolidating UTXOs for ${assetId}`);
      const amount = (
        await fireblocksVaultAccountService.getAssetBalanceForVaultAccount(
          fireblocksVaultAccountId,
          assetId
        )
      ).total;
      await transactionService.createConsolidationTx(assetId, amount, fireblocksVaultAccountId);
    } catch (error) {
      logger.error(error);
    }
  }
  /**
   * A job that runs every day as a backup for the deposit-triggered consolidation process. It will check if any utxo wallet in the omnibus vault account has more than 250 unspent inputs and will trigger a consolidation tx if it does.
   */
  public async backupProcess(walletId: string): Promise<void> {
    setInterval(
      async () => {
        try {
          logger.info(`Starting consolidation backup process...`);
          let i = 0; // counter for consolidation txs
          for (const assetId of utxoAssets) {
            // check if the omnibus wallet has 250 inputs or more to fire the backup consolidation process
            while (
              (
                await fireblocksVaultAccountService.getUnspentInputs(
                  walletId,
                  assetId
                )
              ).length >= 250
            ) {
              logger.info(
                `Consolidating UTXOs for ${assetId} as part of the consolidation backup process`
              );
              const maxSpendableAmount =
                await fireblocksVaultAccountService.getMaxSpendableAmount(
                  walletId,
                  assetId
                );
              if (!maxSpendableAmount) {
                logger.error(
                  `Failed to fetch max spendable amount for omnibus vault account`
                );
              }
              logger.info(
                `Max spendable amount: ${maxSpendableAmount} for asset: ${assetId}`
              );
              const txId = (
                await transactionService.createConsolidationTx(
                  assetId,
                  maxSpendableAmount,
                  walletId
                )
              ).id;
              await fireblocksTransactionService.monitorTxToFinality(txId);
              await this.clearUtxoDepositsCounter(assetId);
              i += 1;
              logger.info(`Run #${i} of backup service`);
            }
            continue;
          }
          if (i === 0) {
            logger.info(
              `Consolidation backup process done, no wallets had 250 UTXOs or more `
            );
          }
        } catch (error) {
          logger.error(
            `Error while running consolidation backup procees: ${error}`
          );
        }
      },
      24 * 60 * 60 * 1000
      // 24 * 60 * 60 * 1000 //backup process will run every 24H
    );
  }
}

export const consolidationService = new ConsolidationService();
