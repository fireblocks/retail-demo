import { Request, Response } from 'express';
import { WebhookEvents } from 'src/types/WebhookEvents';
import { TransactionStateEnum, TransferPeerPathType } from '@fireblocks/ts-sdk';
import { webSocketService } from 'src/app';
import { WalletService } from '@service/wallet.service';
import { TransactionService } from '@service/transaction.service';
import { VaultAccountService } from '@service/fireblocks/vaultAccount.service';
import { WalletAssetService } from '@service/walletAsset.service';
import { VaultService } from '@service/vault.service';
import { AssetService } from '@service/assetService';

export class WebhookController {
  private static walletService = new WalletService();
  private static assetService = new AssetService();
  private static transactionService = new TransactionService();
  private static vaultAccountService = new VaultAccountService();
  private static walletAssetService = new WalletAssetService();
  private static vaultService = new VaultService();

  private static PENDING_STATUSES = [
    TransactionStateEnum.PendingSignature,
    TransactionStateEnum.Confirming,
    TransactionStateEnum.Submitted,
    TransactionStateEnum.PendingAuthorization,
    TransactionStateEnum.Broadcasting,
    TransactionStateEnum.Queued,
    TransactionStateEnum.Cancelling,
    TransactionStateEnum.PendingAmlScreening,
    "PENDING_ENRICHMENT"
  ];

  public static async handleWebhookMessage(req: Request, res: Response): Promise<void> {
    try {
      const { type, data: txData } = req.body;

      switch (type) {
        case WebhookEvents.NewTransactionCreated:
          await WebhookController.handleNewTransaction(txData);
          break;
        case WebhookEvents.TransactionStatusUpdated:
          await WebhookController.handleTransactionUpdate(txData);
          break;
        default:
          console.log("Got a new non-transaction webhook. Ignoring.");
          break;
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
    res.status(200).send('ok');
  }

  private static checkTxStatus(txData: any): boolean | 'pending' {
    if (txData.status === TransactionStateEnum.Completed) return true;
    if (WebhookController.PENDING_STATUSES.includes(txData.status)) return 'pending';
    return false;
  }

  private static async handleNewTransaction(txData: any): Promise<void> {
    console.log("Handling a new transaction webhook");
    if (WebhookController.isIncomingTransaction(txData)) {
      await WebhookController.handleNewIncomingTransaction(txData);
    } else if (WebhookController.isOutgoingTransaction(txData) || WebhookController.isSweepingTransaction(txData)) {
      await WebhookController.handleNewOutgoingTransaction(txData);
    }
  }

  private static isIncomingTransaction(txData: any): boolean {
    return txData.source.type === 'UNKNOWN' && txData.destination.type === TransferPeerPathType.VaultAccount;
  }

  private static isOutgoingTransaction(txData: any): boolean {
    return txData.source.type === TransferPeerPathType.VaultAccount;
  }

  private static isSweepingTransaction(txData: any): boolean {
    return (
      txData.source.type === TransferPeerPathType.VaultAccount &&
      txData.destination.type === TransferPeerPathType.VaultAccount &&
      txData.destination.id === '0'
    );
  }

  private static async handleNewIncomingTransaction(txData: any): Promise<void> {
    console.log('Handling new incoming transaction, data:', txData);
    const wallet = await WebhookController.walletService.getWalletForAddress(txData.destinationAddress);

    await WebhookController.transactionService.addTransaction(
      wallet,
      txData.amount,
      txData.assetId,
      txData.id,
      txData.status,
      txData.txHash || '',
      await WebhookController.vaultService.getVaultAccountForFireblocksVaultId(txData.source.id) || '',
      await WebhookController.vaultService.getVaultAccountForFireblocksVaultId(txData.destination.id) || '',
      txData.sourceAddress || '',
      txData.destinationAddress || ''
    );

    await WebhookController.walletAssetService.updatePendingBalance(txData, 'incoming', wallet);
    await WebhookController.assetService.updateIsSwept(false, txData.destination.id, txData.assetId);
    WebhookController.notifyUser(wallet.user.id, "new_incoming_transaction", { fireblocksTxId: txData.id, ...txData });
  }

  private static async handleNewOutgoingTransaction(txData: any): Promise<void> {
    console.log('Handling new outgoing or sweeping transaction - doing nothing for now.');
  }

  private static async handleTransactionUpdate(txData: any): Promise<void> {
    console.log("In handling tx status update, txId and status:", txData.id, txData.status);

    await WebhookController.transactionService.updateTransactionStatus(txData.id, txData.status);
    const txStatus = WebhookController.checkTxStatus(txData);

    if (txStatus === true) {
      await WebhookController.handleCompletedTransaction(txData);
    } else if (txStatus === 'pending') {
      console.log('Transaction is still pending');
    } else {
      await WebhookController.handleFailedTransaction(txData);
    }
  }

  private static async handleCompletedTransaction(txData: any): Promise<void> {
    if (WebhookController.isSweepingTransaction(txData)) {
      await WebhookController.handleCompletedSweepingTransaction(txData);
    } else if (WebhookController.isIncomingTransaction(txData)) {
      await WebhookController.handleCompletedIncomingTransaction(txData);
    } else if (WebhookController.isOutgoingTransaction(txData)) {
      await WebhookController.handleCompletedOutgoingTransaction(txData);
    }
    await this.transactionService.updateCompletedTransactionDetails(txData)
  }

  private static async handleCompletedSweepingTransaction(txData: any): Promise<void> {
    console.log("Handling finished sweeping transaction.");
    await WebhookController.assetService.updateSweepingBalance(txData);
  }

  private static async handleCompletedIncomingTransaction(txData: any): Promise<void> {
    console.log("Handling completed incoming transaction");
    const wallet = await WebhookController.walletService.getWalletForAddress(txData.destinationAddress);
    const { blockHeight } = await WebhookController.vaultAccountService.getVaultWalletBalance(txData.destination.id, txData.assetId);

    if (blockHeight == txData.blockInfo.blockHeight || blockHeight > txData.blockInfo.blockHeight || txData.assetId === 'BTC_TEST') {
      await WebhookController.walletAssetService.updateAssetBalance(wallet, txData.assetId, parseFloat(txData.amountInfo.amount));
      await WebhookController.assetService.updateIncomingBalance(txData, wallet);
      const tx = await WebhookController.transactionService.updateTransactionStatus(txData.id, txData.status);
      WebhookController.notifyUser(wallet.user.id, "transaction_status", tx);
      WebhookController.notifyUser(wallet.user.id, "balance_update", {assetId: txData.assetId, amount: txData.amountInfo.amount});
    } else {
      throw new Error("Webhook blockheight and balance blockheight don't match - not updating wallet balance");
    }
  }

  private static async handleCompletedOutgoingTransaction(txData: any): Promise<void> {
    console.log(`In update completed outgoing transaction, fireblocksTxId: ${txData.id}, status: ${txData.status}`);
    const amount = Number(txData.amountInfo.amount) * -1;
    const { wallet, transaction } = await WebhookController.transactionService.getWalletForFireblocksTx(txData.id);
    await WebhookController.walletAssetService.updateAssetBalance(wallet, txData.assetId, amount);
    await WebhookController.walletAssetService.updatePendingBalance({ amountInfo: { amount } }, "outgoing", wallet);
    WebhookController.notifyUser(wallet.user.id, "transaction_status", transaction);
    WebhookController.notifyUser(wallet.user.id, "balance_update", { assetId: txData.assetId, amount });
  }

  private static async handleFailedTransaction(txData: any): Promise<void> {
    console.log("Detected failed transaction.");
    if (WebhookController.isIncomingTransaction(txData)) {
      await WebhookController.handleFailedIncomingTransaction(txData);
    } else if (WebhookController.isOutgoingTransaction(txData)) {
      await WebhookController.handleFailedOutgoingTransaction(txData);
    } else {
      console.log("Detected failed sweeping transaction.");
    }
  }

  private static async handleFailedIncomingTransaction(txData: any): Promise<void> {
    console.log("Detected failed incoming transaction. Removing pending incoming balance");
    const wallet = await WebhookController.walletService.getWalletForAddress(txData.destinationAddress);
    await WebhookController.walletAssetService.updatePendingBalance({ amountInfo: { amount: Number(txData.amountInfo.amount) * -1 } }, 'incoming', wallet);
  }

  private static async handleFailedOutgoingTransaction(txData: any): Promise<void> {
    console.log("Detected failed outgoing transaction. Removing pending outgoing balance");
    const { wallet, transaction } = await WebhookController.transactionService.getWalletForFireblocksTx(txData.id);
    await WebhookController.walletAssetService.updatePendingBalance({ amountInfo: { amount: Number(txData.amountInfo.amount) * -1 } }, 'outgoing', wallet);
    await WebhookController.walletAssetService.updateAssetBalance(wallet, txData.assetId, parseFloat(txData.amountInfo.amount));
    WebhookController.notifyUser(wallet.user.id, "transaction_status", transaction);
    WebhookController.notifyUser(wallet.user.id, "balance_update", { assetId: txData.assetId, amount: txData.amountInfo.amount })
  }

  private static notifyUser(userId: string, type: string, message: any): void {
    webSocketService.sendToUser(userId, { type, message });
  }
}
