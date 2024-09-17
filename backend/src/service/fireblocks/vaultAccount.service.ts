import {
  CreateAddressResponse,
  CreateVaultAssetResponse,
  PaginatedAddressResponse,
  UnspentInputsResponse,
  VaultAccount,
  VaultAsset,
} from '@fireblocks/ts-sdk';
import apiClient from './api.client';

export class VaultAccountService {
  async createVaultAccount(
    name: string,
    customerRefId?: string,
    autoFuel: boolean = true,
    hiddenOnUI: boolean = true
  ): Promise<VaultAccount | undefined> {
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
  }

  async renameVaultAccount(walletId: string, walletName: string): Promise<boolean> {
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
  }

  async createVaultWallet(
    vaultAccountId: string,
    assetId: string
  ): Promise<CreateVaultAssetResponse | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.createVaultAccountAsset({
        vaultAccountId,
        assetId,
      })
    ).data;
  }

  async createDepositAddress(
    vaultAccountId: string,
    assetId: string,
    description?: string,
    customerRefId?: string
  ): Promise<CreateAddressResponse | undefined> {
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
  }

  async updateDepositAddressDescription(
    walletId: string,
    assetId: string,
    depositAddressId: string
  ): Promise<boolean> {
    return (
      await apiClient.fireblocksClient.vaults.updateVaultAccountAssetAddress({
        vaultAccountId: walletId,
        assetId,
        addressId: depositAddressId,
      })
    ).data.success;
  }

  async activateVaultWallet(
    walletId: string,
    assetId: string
  ): Promise<CreateVaultAssetResponse | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.activateAssetForVaultAccount({
        vaultAccountId: walletId,
        assetId,
      })
    ).data;
  }

  async getVaultWalletBalance(
    walletId: string,
    assetId: string
  ): Promise<VaultAsset | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.getVaultAccountAsset({
        vaultAccountId: walletId,
        assetId,
      })
    ).data;
  }

  async getMaxSpendableAmount(
    walletId: string,
    assetId: string
  ): Promise<string | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.getMaxSpendableAmount({
        vaultAccountId: walletId,
        assetId,
      })
    ).data.maxSpendableAmount;
  }

  async getUnspentInputs(
    walletId: string,
    assetId: string
  ): Promise<Array<UnspentInputsResponse> | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.getUnspentInputs({
        vaultAccountId: walletId,
        assetId,
      })
    ).data;
  }

  async getWalletsBalances(
    walletNamePrefix?: string,
    walletNameSuffix?: string
  ): Promise<Array<VaultAsset> | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.getVaultAssets({
        accountNamePrefix: walletNamePrefix,
        accountNameSuffix: walletNameSuffix,
      })
    ).data;
  }

  async getAssetBalanceForWallet(
    walletId: string,
    assetId: string
  ): Promise<VaultAsset | undefined> {
    console.log(`Fetching balance for ${assetId} on wallet id ${walletId}`);
    return (
      await apiClient.fireblocksClient.vaults.getVaultAccountAsset({
        vaultAccountId: walletId,
        assetId,
      })
    ).data;
  }

  async getAddresses(
    vaultAccountId: string,
    assetId: string,
    limit?: number,
    before?: string,
    after?: string
  ): Promise<PaginatedAddressResponse | undefined> {
    return (
      await apiClient.fireblocksClient.vaults.getVaultAccountAssetAddressesPaginated(
        { vaultAccountId, assetId, limit, before, after }
      )
    ).data;
  }
}
