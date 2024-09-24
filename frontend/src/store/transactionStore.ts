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
  createdAt: string | number,
  outgoing: boolean
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
    // Ensure createdAt is a Unix timestamp in milliseconds
    const createdAt = typeof transaction.createdAt === 'string' 
      ? parseInt(transaction.createdAt, 10) * 1000 // Convert seconds to milliseconds if needed
      : Date.now(); // Use current timestamp if not provided

    this.transactions.push({
      ...transaction, 
      outgoing: false,
      createdAt: createdAt.toString() // Store as string for consistency
    });
  }

  updateTransactionStatus(transaction: Transaction) {
    let found = false;
    console.log("Looking for transaction:", transaction)
    for (let tx of this.transactions) {
      if (tx.fireblocksTxId === transaction.fireblocksTxId) {
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