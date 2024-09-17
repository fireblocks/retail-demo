import { makeAutoObservable } from "mobx";
import apiService from "@/services/api.service";
import walletStore from "./walletStore";

interface Transaction {
  id: string;
  assetId: string,
  fireblocksTxId: string;
  txHash: string,
  amount: string,
  destinationExternalAddress: string,
  status: string,
  createdAt: any
}

class TransactionStore {
  transactions: Transaction[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setTransactions(transactions: Transaction[]) {
    this.transactions = [...transactions];
  }

  addTransaction(transaction: Transaction) {
    this.transactions.push({...transaction});
  }

  updateTransactionStatus(transaction: Transaction) {
    let found = false;
    console.log("Looking for transaction:", transaction)
    for (let tx of this.transactions) {
      if (tx.fireblocksTxId === transaction.id) {
        tx.status = transaction.status;
        found = true;
        break; 
      }
    }
    if (!found) {
      console.log(`Fireblocks Transaction ID: ${transaction.fireblocksTxId} not found.`);
    }
  }

  async fetchTransactions() {
    try {
      const transactions = await apiService.getTransactions();
      console.log("Got transactions:", transactions)
      this.setTransactions(transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }

  getTransactions() {
    return this.transactions;
  }
}

const transactionStore = new TransactionStore();
export default transactionStore;