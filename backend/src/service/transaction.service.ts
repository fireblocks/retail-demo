import { Transaction } from '@model/Transaction';
import { VaultAccount } from '@model/VaultAccount';
import { Wallet } from '@model/Wallet';
import { createLogger } from '@util/logger.utils';
import { fireblocksTransactionService } from '@service/fireblocks';
import {
  TransferPeerPathType,
  TransactionRequestFeeLevelEnum,
  TransactionResponse,
} from '@fireblocks/ts-sdk';
import { DBTransaction } from 'src/types/interfaces';

const logger = createLogger('<Tx Service>');

class TransactionService {
  async getWalletForFireblocksTx(
    fireblocksTxId: string
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    const transaction = await Transaction.findOne({
      where: { fireblocksTxId },
      relations: ['wallet'],
    });

    const wallet: Wallet = await Wallet.findOne({
      where: { id: transaction.wallet.id },
      relations: ['user'],
    });

    return { wallet, transaction };
  }

  async addTransaction(txParams: DBTransaction): Promise<void> {
    const transaction = Transaction.create({
      wallet: txParams.wallet,
      amount: txParams.amount,
      assetId: txParams.assetId,
      fireblocksTxId: txParams.fireblocksTxId,
      status: txParams.status,
      txHash: txParams.txHash || null,
      sourceVaultAccount: txParams.sourceVaultAccount || null,
      destinationVaultAccount: txParams.destinationVaultAccount || null,
      sourceExternalAddress: txParams.sourceExternalAddress || null,
      destinationExternalAddress: txParams.destinationExternalAddress || null,
      createdAt: txParams.createdAt,
      outgoing: txParams.outgoing,
      externalTxId: txParams.externalTxId
    });

    logger.info(
      `Saving new transaction to the DB, tx object: ${JSON.stringify(transaction, null, 2)}`
    );

    transaction.save();
  }

  async updateTransactionStatus(txId, status) {
    const transaction = await Transaction.findOne({
      where: { fireblocksTxId: txId },
    });
    logger.info(
      `in update tx status for transaction: ${JSON.stringify(transaction, null, 2)}, fbksTxId: ${txId}, status: ${status}`
    );
    transaction.status = status;
    logger.info(`Saving the transaction after status update: ${JSON.stringify(transaction, null, 2)}`);
    transaction.save();
    return transaction;
  }

  async updateCompletedTransactionDetails(txData: any): Promise<Transaction> {
    const transaction = await Transaction.findOne({
      where: { fireblocksTxId: txData.id },
      relations: ['sourceVaultAccount', 'destinationVaultAccount', 'wallet'],
    });

    if (!transaction) {
      throw new Error(`Transaction with fireblocksTxId ${txData.id} not found`);
    }

    transaction.assetId = txData.assetId || transaction.assetId;
    transaction.status = txData.status || transaction.status;
    transaction.txHash = txData.txHash || transaction.txHash;
    transaction.amount = txData.amountInfo.amount || transaction.amount;

    if (txData.source.type === TransferPeerPathType.Unknown) {
      transaction.sourceExternalAddress = txData.sourceAddress;
    }
    if (txData.destination.type === TransferPeerPathType.OneTimeAddress) {
      transaction.destinationExternalAddress = txData.destinationAddress;
    }

    if (txData.source.type === TransferPeerPathType.VaultAccount) {
      transaction.sourceVaultAccount =
        (await VaultAccount.findOne({
          where: { fireblocksVaultId: txData.destination.id },
        })) || transaction.sourceVaultAccount;
    }
    if (txData.destination.type === TransferPeerPathType.VaultAccount) {
      transaction.destinationVaultAccount =
        (await VaultAccount.findOne({
          where: { fireblocksVaultId: txData.destination.id },
        })) || transaction.destinationVaultAccount;
    }
    logger.info(`Updating Completed Transaction Details, txInfo:\n ${JSON.stringify(txData, null, 2)}`)
    await transaction.save();
    logger.info(`Returning updated transaction object:\n ${JSON.stringify(transaction, null, 2)}`)
    return transaction;
  }

  public async createConsolidationTx(
    assetId: string,
    amount: string,
    walletId: string
  ): Promise<TransactionResponse> {
    const transactionPayload = {
      assetId: assetId,
      amount,
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: walletId,
      },
      destination: {
        type: TransferPeerPathType.VaultAccount,
        id: walletId,
      },
      feeLevel: TransactionRequestFeeLevelEnum.Low,
      note: `Automated UTXO consolidation Tx for ${assetId}`,
    };
    try {
      logger.info(`Creating an automated consolidation Tx for ${assetId}`);
      return await fireblocksTransactionService.createTransaction(
        transactionPayload
      );
    } catch (error) {
      logger.error(
        `Error creating consolidation transaction for asset ${assetId}`,
        error
      );
    }
  }
}

export const transactionService = new TransactionService();
