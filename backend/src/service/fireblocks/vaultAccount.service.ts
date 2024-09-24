import {
  CreateAddressResponse,
  CreateVaultAssetResponse,
  PaginatedAddressResponse,
  UnspentInputsResponse,
  VaultAccount,
  VaultAsset,
} from '@fireblocks/ts-sdk';
import apiClient from './api.client';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Fireblocks Vault Account Service>');

class FireblocksVaultAccountService {
  async createVaultAccount(
    name: string,
    customerRefId?: string,
    autoFuel: boolean = true,
    hiddenOnUI: boolean = true
  ): Promise<VaultAccount | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.createVaultAccount({
          createVaultAccountRequest: {
            name,
            hiddenOnUI,
            customerRefId,
            autoFuel,
          },
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async renameVaultAccount(
    walletId: string,
    walletName: string
  ): Promise<boolean> {
    try {
      const response = (
        await apiClient.fireblocksClient.vaults.updateVaultAccount({
          vaultAccountId: walletId,
          updateVaultAccountRequest: { name: walletName },
        })
      ).statusCode;
      if (response === 201) {
        return true;
      }
      return false;
    } catch (error) {
      throw error.response.data;
    }
  }

  async createVaultWallet(
    vaultAccountId: string,
    assetId: string
  ): Promise<CreateVaultAssetResponse | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.createVaultAccountAsset({
          vaultAccountId,
          assetId,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async createDepositAddress(
    vaultAccountId: string,
    assetId: string,
    description?: string,
    customerRefId?: string
  ): Promise<CreateAddressResponse | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.createVaultAccountAssetAddress({
          vaultAccountId,
          assetId,
          createAddressRequest: {
            description,
            customerRefId,
          },
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async updateDepositAddressDescription(
    walletId: string,
    assetId: string,
    depositAddressId: string
  ): Promise<boolean> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.updateVaultAccountAssetAddress({
          vaultAccountId: walletId,
          assetId,
          addressId: depositAddressId,
        })
      ).data.success;
    } catch (error) {
      throw error.response.data;
    }
  }

  async activateVaultWallet(
    walletId: string,
    assetId: string
  ): Promise<CreateVaultAssetResponse | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.activateAssetForVaultAccount({
          vaultAccountId: walletId,
          assetId,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getVaultWalletBalance(
    walletId: string,
    assetId: string
  ): Promise<VaultAsset | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.getVaultAccountAsset({
          vaultAccountId: walletId,
          assetId,
        })
      ).data;
    } catch (error) {
      logger.error(`Error getting vault balance for vault account ${walletId}, asset: ${assetId}`)
      throw error.response.data;
    }
  }

  async getMaxSpendableAmount(
    walletId: string,
    assetId: string
  ): Promise<string | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.getMaxSpendableAmount({
          vaultAccountId: walletId,
          assetId,
        })
      ).data.maxSpendableAmount;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getUnspentInputs(
    walletId: string,
    assetId: string
  ): Promise<Array<UnspentInputsResponse> | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.getUnspentInputs({
          vaultAccountId: walletId,
          assetId,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getWalletsBalances(
    walletNamePrefix?: string,
    walletNameSuffix?: string
  ): Promise<Array<VaultAsset> | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.getVaultAssets({
          accountNamePrefix: walletNamePrefix,
          accountNameSuffix: walletNameSuffix,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getAssetBalanceForVaultAccount(
    fireblocksVaultAccountId: string,
    assetId: string
  ): Promise<VaultAsset | undefined> {
    logger.info(
      `Fireblocks Vault Account Service: Fetching balance for ${assetId} on vault account id ${fireblocksVaultAccountId}`
    );
    try {
      return (
        await apiClient.fireblocksClient.vaults.getVaultAccountAsset({
          vaultAccountId: fireblocksVaultAccountId,
          assetId,
        })
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getAddresses(
    vaultAccountId: string,
    assetId: string,
    limit?: number,
    before?: string,
    after?: string
  ): Promise<PaginatedAddressResponse | undefined> {
    try {
      return (
        await apiClient.fireblocksClient.vaults.getVaultAccountAssetAddressesPaginated(
          { vaultAccountId, assetId, limit, before, after }
        )
      ).data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export const fireblocksVaultAccountService =
  new FireblocksVaultAccountService();
