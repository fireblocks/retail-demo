import { createLogger } from '@util/logger.utils';
import { fireblocksTransactionService } from './fireblocks';

// Create a logger instance for the Fee Service
const logger = createLogger('<Fee Service>');

// Average transaction size in bytes for BTC transactions
const AVG_TX_SIZE_IN_BYTES = 250;

class FeeService {
  // Cache for BTC network fee
  private btcNetworkFeeCache: any = null;
  // Timestamp of the last cache update
  private btcNetworkFeeCacheTimestamp: number = 0;
  // Duration for which the cache is valid (30 seconds)
  private readonly CACHE_DURATION_MS = 30000;

  /**
   * Estimates the transaction fee for a given transaction.
   * @param transaction - The transaction object containing details like assetId.
   * @returns The estimated transaction fee.
   */
  public estimateTransactionFee = async (transaction: any) => {
    const assetId = transaction.assetId;

    // If the asset is not BTC or BTC_TEST, use Fireblocks service to estimate the fee
    if (assetId !== 'BTC' && assetId !== 'BTC_TEST') {
      const txFee = await fireblocksTransactionService.estimateTransactionFee(transaction);
      logger.info("Got a non BTC tx fee estimation:", txFee);
      return txFee;
    } else {
      const currentTime = Date.now();

      // Check if the cache is empty or expired
      if (!this.btcNetworkFeeCache || (currentTime - this.btcNetworkFeeCacheTimestamp) > this.CACHE_DURATION_MS) {
        // Fetch new BTC network fee from Fireblocks and update the cache
        this.btcNetworkFeeCache = await fireblocksTransactionService.getNetworkFee(assetId);
        this.btcNetworkFeeCacheTimestamp = currentTime;
        logger.info("Fetched new BTC network fee from Fireblocks:", JSON.stringify(this.btcNetworkFeeCache, null, 2));
      } else {
        // Use the cached BTC network fee
        logger.info("Using cached BTC network fee:", JSON.stringify(this.btcNetworkFeeCache, null, 2));
      }

      // Calculate the transaction fee based on the network fee and average transaction size
      const networkFee = this.btcNetworkFeeCache;
      return {
        "low": String(AVG_TX_SIZE_IN_BYTES * parseFloat(networkFee.low.feePerByte)),
        "medium": String(AVG_TX_SIZE_IN_BYTES * parseFloat(networkFee.medium.feePerByte)),
        "high": String(AVG_TX_SIZE_IN_BYTES * parseFloat(networkFee.high.feePerByte))
      };
    }
  }
}

// Export an instance of FeeService
export const feeService = new FeeService();
