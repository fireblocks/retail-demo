import axiosInstance from "./axios.service";
import * as urls from "../lib/constants";
import authStore from "@/store/authStore";
import terminalStore from "@/store/terminalStore";
import { TransactionParams } from "@/lib/types";

class ApiService {
  /**
   * Fetches the user's wallet
   * @returns {Promise<any>} The wallet data
   */
  getWallet = async () => {
    try {
      return (await axiosInstance.get(urls.WALLET)).data;
    } catch (error) {
      console.error("Error fetching wallets:", error);
      throw error;
    }
  };

  /**
   * Creates a new wallet for the user
   * @returns {Promise<any>} The newly created wallet data
   */
  createUserWallet = async () => {
    try {
      const newWallet = await axiosInstance.post(urls.WALLET);
      console.log("Created a new wallet for the user:", newWallet)
      return newWallet.data;
    } catch (error) {
      console.log("Failed to create user wallet for user:", authStore.user.id);
      throw error;
    }
  };

  getWalletAssets = async (walletId: string) => {
    try {
      const url = urls.getAssetsUrl(walletId);
      return (await axiosInstance.get(url)).data;
    } catch (error) {
      console.error("Error fetching wallet assets:", error);
    }
  };

  createWalletAsset = async (walletId: string, assetId: string) => {
    try {
      const url = urls.getAssetsUrl(walletId);
      const newAsset = axiosInstance.post(url, {
        assetId,
      });
      return newAsset;
    } catch (error) {
      console.error("Error creating wallet assets:", error);
    }
  };

  createTransaction = async (
    amount: string,
    assetId: string,
    destination: string,
    feeLevel: string
  ) => {
    try {
      const transactionRequest = {
        amount,
        assetId,
        feeLevel,
        destination: {
          type: "ONE_TIME_ADDRESS",
          oneTimeAddress: {
            address: destination,
          },
        },
      };
      const res = await axiosInstance.post(urls.SUBMIT_TRANSACTION, {
        transactionRequest,
      });
      const message = `${new Date().toISOString()}: Created a new transaction from the withdrawal vault account. We have 3 withdrawal vault accounts and we are randomly creating transactions from these when users want to withdraw their funds.`
      terminalStore.addLog(message)
      return res.data; 
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  };

  async getTransactions() {
    const response = await axiosInstance.get(urls.TRANSCATIONS);
    return response.data;
  }

  async getTxFee(txData: TransactionParams) {
    const response = await axiosInstance.post(urls.TRANSCATIONS, { transactionRequest: txData });
    return response.data;
  }

  async getCosigner() {
    const response = await axiosInstance.get(urls.COSIGNER);
    return response.data;
  }

  async getCosigners() {
    const response = await axiosInstance.get(urls.COSIGNERS);
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
