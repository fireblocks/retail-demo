import { TransactionRequest, TransferPeerPathType } from '@fireblocks/ts-sdk';
import { Request, Response } from 'express';
import { User } from '@model/User';
import { Wallet } from '@model/Wallet';
import {
  walletService,
  walletAssetService,
  transactionService,
} from '@service';
import { fireblocksTransactionService } from '@service/fireblocks/';
import { createLogger } from '@util/logger.utils';
import { feeService } from '@service/fee.service';
import { vaultConfig } from '@util/vaultConfig';
import { randomUUID } from 'crypto';

const logger = createLogger('<Transaction Controller>');

export class TransactionController {
  private static convertUiTxRequestToFireblocksTx(uiTxData: any) {
    const withdrawalVaultAccountId = vaultConfig.getRandomWithdrawalVaultId();

    const fireblocksTxData: TransactionRequest = {
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: withdrawalVaultAccountId,
      },
      destination: {
        type: TransferPeerPathType.OneTimeAddress,
        oneTimeAddress: {
          address: uiTxData.destination,
        },
      },
      assetId: uiTxData.assetId,
      amount: uiTxData.amount,
    };

    return fireblocksTxData;
  }

  static async initiateNewTxFlow(req: Request, res: Response) {
    try {
      const txRequest = req.body.transactionRequest;
      const txFee = await feeService.estimateTransactionFee(
        TransactionController.convertUiTxRequestToFireblocksTx(txRequest)
      );
      res.status(200).send(txFee);
    } catch (error) {
      logger.error(
        `${'Failed to initiate new transaction flow:'} ${JSON.stringify(error, null, 2)}`
      );

      res.status(500).send();
    }
  }
  static async createNewTransfer(req: Request, res: Response) {
    try {
      const withdrawalVaultAccountId = vaultConfig.getRandomWithdrawalVaultId();
      const user = req.user as User;
      const wallet = user.wallet;
      const transactionRequest = req.body.transactionRequest;

      // Check that tx amount is lower/same as the current balance
      const currentBalance = await walletService.getWalletAssetBalance(
        wallet.id,
        transactionRequest.assetId
      );
      logger.info(
        `Current balance is: ${currentBalance.totalBalance}. Request to withdraw is: ${transactionRequest.amount}`
      );
      if (currentBalance.totalBalance < Number(transactionRequest.amount)) {
        throw new Error(
          `Attempt to withdraw amount higher than the existing balance. Context: wallet: ${wallet.id}, user: ${user.id}`
        );
      }

      const externalTxId = randomUUID();
      logger.info(`Generated new externalTxId: ${externalTxId}`)

      transactionRequest.source = {
        type: TransferPeerPathType.VaultAccount,
        id: withdrawalVaultAccountId,
      };

      transactionRequest.externalTxId = externalTxId;

      await walletAssetService.updateAssetBalance(
        wallet,
        transactionRequest.assetId,
        Number(transactionRequest.amount) * -1
      );
      const walletAssetBalance = await walletAssetService.updatePendingBalance(
        {
          amountInfo: {
            amount: transactionRequest.amount,
          },
        },
        'outgoing',
        wallet
      );

      const fireblocksTx = await fireblocksTransactionService.createTransaction(
        transactionRequest as TransactionRequest
      );
      await transactionService.addTransaction({
        wallet,
        amount: transactionRequest.amount,
        assetId: transactionRequest.assetId,
        fireblocksTxId: fireblocksTx.id,
        status: fireblocksTx.status,
        destinationExternalAddress:
          transactionRequest.destination.oneTimeAddress.address,
        outgoing: true,
        createdAt: Date.now().toString(),
        externalTxId
      });
      res.status(200).send({ fireblocksTxId: fireblocksTx.id, status: fireblocksTx.status, ...walletAssetBalance });
    } catch (error) {
      logger.error(JSON.stringify(error, null, 2));
      res.status(500).send();
    }
  }

  static async getTransactions(req: Request, res: Response) {
    const user = req.user as User;
    const wallet = await Wallet.findOne({
      where: { user},
      relations: ['transactions'],
    });
    if (wallet) {
      res.status(200).send(wallet.transactions);
    } else {
      res.status(404).send('No wallet found for transactions');
    }
  }

  static async getNonSweepingTransactions(req: Request, res: Response) {
    try {
      const user = req.user as User;
      
      const wallet = await Wallet.findOne({
        where: { user: { id: user.id } },
        relations: ['transactions'],
      });

      if (!wallet) {
        logger.warn(`No wallet found for user ${user.id}`);
        return res.status(404).json({ message: 'Wallet not found' });
      }

      const nonSweepingTransactions = wallet.transactions.filter(
        transaction => transaction.isSweeping !== true
      );

      logger.info(`Retrieved ${nonSweepingTransactions.length} non-sweeping transactions for user ${user.id}`);
      
      res.status(200).json(nonSweepingTransactions);
    } catch (error) {
      logger.error(`Error fetching non-sweeping transactions: ${error}`);
      res.status(500).json({ message: 'Error fetching transactions' });
    }
  }
}
