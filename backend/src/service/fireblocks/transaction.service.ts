import { TransactionRequestFeeLevelEnum, TransferPeerPathType } from '@fireblocks/ts-sdk';
import type {
  CreateTransactionResponse,
  EstimatedTransactionFeeResponse,
  TransactionRequest,
  TransactionResponse,
} from '@fireblocks/ts-sdk';
import apiClient from './api.client';
import { TransactionService } from '@service/transaction.service';
import { Wallet } from '@model/Wallet';

const transactionService = new TransactionService();

export class FireblocksTransactionService {
  async createTransaction(
    transactionParameters: TransactionRequest
  ): Promise<CreateTransactionResponse> {
    console.log(
      `creating a new transaction with these parameters: ${JSON.stringify(transactionParameters, null, 2)}`
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


    if (transactionParameters.destination.type === TransferPeerPathType.VaultAccount) {
      payload.destination.id = transactionParameters.destination.id;
    } else if (transactionParameters.destination.type === TransferPeerPathType.OneTimeAddress) {
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
      console.log(`Fireblocks txId ${tx.id} created`);
      // transactionService.addTransaction(
      //   wallet,
      //   transactionParameters.amount,
      //   tx.id,
      //   tx.status
      // );
      return tx;
    } catch (error) {
      console.log('Got an error when created transaction:', error);
      throw error; 
    }
  }

  async replaceByFeeTransaction(
    txHash: string,
    transactionParameters: TransactionRequest
  ): Promise<string | undefined> {
    console.log(`Starting a 'replace by fee' transaction`);
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
    const txId = (
      await apiClient.fireblocksClient.transactions.createTransaction({
        transactionRequest: payload,
      })
    ).data.id;
    console.log(`RBF transaction ${txId} created`);
    return txId;
  }

  async estimateTransactionFee(
    transactionParameters: TransactionRequest
  ): Promise<EstimatedTransactionFeeResponse | undefined> {
    console.log(
      `Estimating fee for these transaction parameters: ${JSON.stringify(transactionParameters, null, 2)}`
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

    const response = (
      await apiClient.fireblocksClient.transactions.estimateTransactionFee({
        transactionRequest: payload,
      })
    ).data;
    console.log(
      `Fee estimation results, high: ${JSON.stringify(response.high, null, 2)}\nmedium: ${JSON.stringify(response.medium, null, 2)}\nlow: ${JSON.stringify(response.low, null, 2)}`
    );
    return response;
  }

  async getTransactionById(
    txId: string
  ): Promise<TransactionResponse | undefined> {
    console.log(`Fetching data for transaction id: ${txId}`);
    return (
      await apiClient.fireblocksClient.transactions.getTransaction({
        txId,
      })
    ).data;
  }

  async cancelTransaction(txId: string): Promise<boolean> {
    console.log(`Canceling transaction id: ${txId}`);
    return (
      await apiClient.fireblocksClient.transactions.cancelTransaction({ txId })
    ).data.success;
  }

  async setConfirmationsByTxId(
    txId: string,
    numOfConfirmations: number
  ): Promise<boolean> {
    console.log(
      `Setting ${numOfConfirmations} confirmations for transaction id: ${txId}`
    );
    return (
      await apiClient.fireblocksClient.transactions.setTransactionConfirmationThreshold(
        { txId, setConfirmationsThresholdRequest: { numOfConfirmations } }
      )
    ).data.success;
  }
}
