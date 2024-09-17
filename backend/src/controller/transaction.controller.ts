import { TransactionRequest } from '@fireblocks/ts-sdk';
import { FireblocksTransactionService } from '@service/fireblocks/transaction.service';
import { Request, Response } from 'express';
import { User } from '@model/User';
import { Wallet } from '@model/Wallet';
import { WalletService } from '@service/wallet.service';
import { WalletAssetService } from '@service/walletAsset.service';
import { TransactionService } from '@service/transaction.service';

const fireblocksTransactionService = new FireblocksTransactionService();
const walletService = new WalletService()
const walletAssetService = new WalletAssetService()
const transactionService = new TransactionService()

export class TransactionController {
  static async createNewTransfer(req: Request, res: Response) {

    try {
      const user = req.user as User;
      const wallet = user.wallet;
      const transactionRequest = req.body.transactionRequest;

      // Check that tx amount is lower/same as the current balance
      const currentBalance = await walletService.getWalletAssetBalance(wallet.id, transactionRequest.assetId);
      console.log(`Current balance is: ${currentBalance.totalBalance}. Request to withdraw is: ${transactionRequest.amount}`)
      if (currentBalance.totalBalance < Number(transactionRequest.amount)) {
        throw new Error(`Attempt to withdraw amount higher than the existing balance. Context: wallet: ${wallet.id}, user: ${user.id}`)
      }

      transactionRequest.source = {
        type: 'VAULT_ACCOUNT',
        id: '17',
      };
      await walletAssetService.updateAssetBalance(wallet, transactionRequest.assetId, Number(transactionRequest.amount) * -1)
      await walletAssetService.updatePendingBalance({
        amountInfo: {
          amount: transactionRequest.amount
        }
      }, "outgoing", wallet)

      console.log(
        'Going to send a transaction with the following payload:',
        transactionRequest
      );


      const fireblocksTx = await fireblocksTransactionService.createTransaction(
        transactionRequest as TransactionRequest
      );
      transactionService.addTransaction(wallet, "", transactionRequest.assetId, fireblocksTx.id, fireblocksTx.status)
      res.status(200).send(fireblocksTx);
    } catch(error) {
      console.log(error)
      res.status(500).send()
    } 
  }

  static async getTransactions(req: Request, res: Response) {
    const user = req.user as User;
    const wallet = await Wallet.findOne({
      where: { user: user },
      relations: ['transactions']
    })
    if(wallet){
      res.status(200).send(wallet.transactions)
    } else {
      res.status(404).send("No wallet found for transactions")
    }
    
  }
}
