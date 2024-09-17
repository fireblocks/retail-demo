import { Transaction } from '@model/Transaction';
import { VaultAccount } from '@model/VaultAccount';
import { Wallet } from '@model/Wallet';

export class TransactionService {
  async getWalletForFireblocksTx(fireblocksTxId: string): Promise<{wallet: Wallet, transaction: Transaction}> {
    const transaction = await Transaction.findOne({
      where: { fireblocksTxId },
      relations: ['wallet'],
    });

    const wallet: Wallet = await Wallet.findOne({
      where: { id: transaction.wallet.id },
      relations: ['user'],
    });

    return {wallet, transaction};
  }

  async addTransaction(
    wallet,
    amount,
    assetId,
    fireblocksTxId,
    status,
    txHash?,
    sourceVaultAccount?,
    destinationVaultAccount?,
    sourceExternalAddress?,
    destinationExternalAddress?
  ): Promise<void> {
    const transaction = Transaction.create({
      wallet,
      amount,
      assetId,
      fireblocksTxId,
      status,
      txHash: txHash || null,
      sourceVaultAccount: sourceVaultAccount || null,
      destinationVaultAccount: destinationVaultAccount || null,
      sourceExternalAddress: sourceExternalAddress || null,
      destinationExternalAddress: destinationExternalAddress || null
    });

    console.log("Saving new transaction to the DB, tx object:", transaction)

    transaction.save();
  }

  async updateTransactionStatus(txId, status) {
    const transaction = await Transaction.findOne({
      where: { fireblocksTxId: txId },
    });
    console.log(
      `in update tx status for transaction: ${JSON.stringify(transaction)}, fbksTxId: ${txId}, status: ${status}`
    );
    transaction.status = status;
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

    if (txData.source.type === "UNKNOWN") {
      transaction.sourceExternalAddress = txData.sourceAddress;
    }
    if (txData.destination.type === "ONE_TIME_ADDRESS") {
      transaction.destinationExternalAddress = txData.destinationAddress;
    }

    if (txData.source.type === "VAULT_ACCOUNT") {
      transaction.sourceVaultAccount = await VaultAccount.findOne({where: {fireblocksVaultId: txData.destination.id}}) || transaction.sourceVaultAccount;
    }
    if (txData.destination.type === "VAULT_ACCOUNT") {
      transaction.destinationVaultAccount = await VaultAccount.findOne({where: {fireblocksVaultId: txData.destination.id}}) || transaction.destinationVaultAccount;
    }
    
    await transaction.save();
    return transaction;
  }
}
