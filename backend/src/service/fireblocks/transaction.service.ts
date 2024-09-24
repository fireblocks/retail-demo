import {
  TransactionRequestFeeLevelEnum,
  TransferPeerPathType,
} from '@fireblocks/ts-sdk';
import type {
  CreateTransactionResponse,
  EstimatedNetworkFeeResponse,
  EstimatedTransactionFeeResponse,
  TransactionRequest,
  TransactionResponse,
} from '@fireblocks/ts-sdk';
import apiClient from './api.client';
import { transactionService } from '@service';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Fireblocks Tx Service>');

class FireblocksTransactionService {
  async createTransaction(
    transactionParameters: TransactionRequest
  ): Promise<CreateTransactionResponse> {
    logger.info(
      `creating a new transaction with these parameters: ${JSON.stringify(transactionParameters)}`
    );

    const payload: TransactionRequest = {
      assetId: transactionParameters.assetId,
      amount: String(transactionParameters.amount),
      note: transactionParameters.note,
      source: {
        type: transactionParameters.source.type,
        id: transactionParameters.source.id,
      },
      destination: {
        type: transactionParameters.destination.type,
      },
      feeLevel: transactionParameters.feeLevel,
      customerRefId: transactionParameters.customerRefId,
    };

    if (
      transactionParameters.destination.type ===
      TransferPeerPathType.VaultAccount
    ) {
      payload.destination.id = transactionParameters.destination.id;
    } else if (
      transactionParameters.destination.type ===
      TransferPeerPathType.OneTimeAddress
    ) {
      payload.destination.oneTimeAddress = {
        address: transactionParameters.destination.oneTimeAddress?.address,
        tag: transactionParameters.destination.oneTimeAddress?.tag,
      };
    }

    try {
      const tx = (
        await apiClient.fireblocksClient.transactions.createTransaction({
          transactionRequest: payload,
        })
      ).data;
      logger.info(`Fireblocks txId ${tx.id} created`);
      return tx;
    } catch (error) {
      throw error.response.data;
    }
  }

  async replaceByFeeTransaction(
    txHash: string,
    transactionParameters: TransactionRequest
  ): Promise<string | undefined> {
    logger.info(`Starting a 'replace by fee' transaction`);
    const payload = {
      assetId: transactionParameters.assetId,
      amount: String(transactionParameters.amount),
      replaceTxByHash: txHash,
      note: transactionParameters.note,
      source: {
        type: transactionParameters.source.type,
        id: transactionParameters.source.id,
      },
      destination: {
        type: transactionParameters.destination.type,
        id: transactionParameters.destination.id,
        oneTimeAddress: {
          address: transactionParameters.destination.oneTimeAddress.address,
          tag: transactionParameters.destination.oneTimeAddress.tag,
        },
      },
      feeLevel: TransactionRequestFeeLevelEnum.High,
      customerRefId: transactionParameters.customerRefId,
    };
    try {
      const txId = (
        await apiClient.fireblocksClient.transactions.createTransaction({
          transactionRequest: payload,
        })
      ).data.id;
      logger.info(`RBF transaction ${txId} created`);
      return txId;
    } catch (error) {
      throw error.response.data;
    }
  }
  
  async getNetworkFee(
    assetId: string
  ): Promise<EstimatedNetworkFeeResponse>{
    try {
      const networkFee = await apiClient.fireblocksClient.transactions.estimateNetworkFee({
        assetId
      })
  
      return networkFee.data;
    } catch(error) {
      logger.error(`Failed to get current network fee from Fireblocks for asset ${assetId}`)
      throw error.response.data
    }
    
  }
  async estimateTransactionFee(
    transactionParameters: TransactionRequest
  ): Promise<EstimatedTransactionFeeResponse | undefined> {
    logger.info(
      `Estimating fee for these transaction parameters: ${JSON.stringify(transactionParameters)}`
    );
    const payload = {
      assetId: transactionParameters.assetId,
      amount: String(transactionParameters.amount),
      note: transactionParameters.note,
      source: {
        type: transactionParameters.source.type,
        id: transactionParameters.source.id,
      },
      destination: {
        type: transactionParameters.destination.type,
        id: transactionParameters.destination.id,
        oneTimeAddress: {
          address: transactionParameters.destination.oneTimeAddress.address,
          tag: transactionParameters.destination.oneTimeAddress.tag,
        },
      },
      customerRefId: transactionParameters.customerRefId,
    };
    try {
      const response = (
        await apiClient.fireblocksClient.transactions.estimateTransactionFee({
          transactionRequest: payload,
        })
      ).data;
      logger.info(
        `Fee estimation results, high: ${JSON.stringify(response.high)}\nmedium: ${JSON.stringify(response.medium)}\nlow: ${JSON.stringify(response.low)}`
      );
      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getTransactionById(
    txId: string
  ): Promise<TransactionResponse | undefined> {
    logger.info(`Fetching data for transaction id: ${txId}`);
    try {
      return (
        await apiClient.fireblocksClient.transactions.getTransaction({
          txId,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async monitorTxToFinality(txId: string): Promise<void> {
    logger.info(`Monitoring tx ${txId} until terminal status`);
    try {
      let txStatus = (await this.getTransactionById(txId)).status;
      while (
        ![
          'COMPLETED',
          'CANCELLED',
          'BLOCKED',
          'REJECTED',
          'FAILED',
          'CONFIRMING',
        ].includes(txStatus)
      ) {
        await new Promise((resolve) => setTimeout(resolve, 60000)); //poll every minute
        txStatus = (await this.getTransactionById(txId)).status;
      }
    } catch (error) {
      throw error.response.data;
    }
  }

  async cancelTransaction(txId: string): Promise<boolean> {
    logger.info(`Canceling transaction id: ${txId}`);
    try {
      return (
        await apiClient.fireblocksClient.transactions.cancelTransaction({
          txId,
        })
      ).data.success;
    } catch (error) {
      throw error.response.data;
    }
  }

  async setConfirmationsByTxId(
    txId: string,
    numOfConfirmations: number
  ): Promise<boolean> {
    logger.info(
      `Setting ${numOfConfirmations} confirmations for transaction id: ${txId}`
    );
    try {
      return (
        await apiClient.fireblocksClient.transactions.setTransactionConfirmationThreshold(
          { txId, setConfirmationsThresholdRequest: { numOfConfirmations } }
        )
      ).data.success;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export const fireblocksTransactionService = new FireblocksTransactionService();
