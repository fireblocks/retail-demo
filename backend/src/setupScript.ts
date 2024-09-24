import { VaultAccount } from '@model/VaultAccount';
import { Asset } from '@model/Asset';
import { SupportedAsset } from '@model/SupportedAsset';
import { fireblocksVaultAccountService } from '@service/fireblocks';
import 'dotenv/config';
import { createLogger } from '@util/logger.utils';
import supportedAssets from '@util/supportedAssets.json';
import { vaultConfig } from '@util/vaultConfig';

const logger = createLogger('<Initial Setup>');

async function createVaultAccount(
  name: string,
  existingId?: string
): Promise<VaultAccount> {
  let vaultAccount = await VaultAccount.findOne({ where: { name } });

  if (!vaultAccount) {
    if (existingId) {
      vaultAccount = VaultAccount.create({
        fireblocksVaultId: existingId,
        name,
      });
      logger.info(`Created ${name} vault account in DB only`);
    } else {
      const response =
        await fireblocksVaultAccountService.createVaultAccount(name, undefined, false, false);
      vaultAccount = VaultAccount.create({
        fireblocksVaultId: response.id,
        name,
      });
      logger.info(`Created ${name} vault account in DB and Fireblocks`);
    }
    await vaultAccount.save();
  }
  logger.info(`${name} vault account exists in DB and Fireblocks. Ignoring.`);
  return vaultAccount;
}

async function createOrUpdateAsset(
  assetId: string,
  vaultAccount: VaultAccount
): Promise<void> {
  let existingAsset = await Asset.findOne({
    where: { assetId, vaultAccount: { id: vaultAccount.id } },
  });

  if (!existingAsset) {
    try {
      let assetBalance;
      try {
        assetBalance = await fireblocksVaultAccountService.getVaultWalletBalance(
          vaultAccount.fireblocksVaultId,
          assetId
        );
      } catch (error) {
        logger.info(`No existing ${assetId} vault wallet found in Fireblocks for vault account: ${vaultAccount.fireblocksVaultId}. Proceeding to create it.`);
      }

      if (assetBalance) {
        // Asset exists in Fireblocks, fetch its address
        logger.info(`There is a ${assetId} vault wallet in vault account: ${vaultAccount.fireblocksVaultId}. Going to fetch the address and save in local DB only.`);
        let addressesResponse;
        try {
          addressesResponse = await fireblocksVaultAccountService.getAddresses(
            vaultAccount.fireblocksVaultId,
            assetId
          );
        } catch (error) {
          logger.info(`Failed to fetch addresses for ${assetId} in vault account: ${vaultAccount.fireblocksVaultId}. Proceeding without address.`);
        }
        const address =
          addressesResponse && addressesResponse.addresses && addressesResponse.addresses.length > 0
            ? addressesResponse.addresses[0].address
            : null;

        // Create it in our DB with the current balance and address
        existingAsset = Asset.create({
          assetId,
          assetName: assetId,
          address: address,
          balance: parseFloat(assetBalance.available),
          vaultAccount,
        });
      } else {
        // Asset doesn't exist in Fireblocks, create it
        logger.info(`There is NO ${assetId} vault wallet in vault account: ${vaultAccount.fireblocksVaultId}. Going to create vault wallet and save in local DB.`);
        let newAddress;
        try {
          newAddress = await fireblocksVaultAccountService.createVaultWallet(
            vaultAccount.fireblocksVaultId,
            assetId
          );
        } catch (error) {
          logger.error(`Failed to create vault wallet for ${assetId} in vault account: ${vaultAccount.fireblocksVaultId}.`, error);
          return;
        }
        existingAsset = Asset.create({
          assetId,
          assetName: assetId,
          address: newAddress.address,
          balance: 0,
          vaultAccount,
        });
      }
      await existingAsset.save();
    } catch (error) {
      logger.error(
        `Error creating/updating asset ${assetId} for vault ${vaultAccount.fireblocksVaultId}:`,
        error
      );
    }
  }
}

async function createOrUpdateSupportedAssets(): Promise<void> {
  for (const asset of supportedAssets) {
    const existingAsset = await SupportedAsset.findOne({ where: { fireblocksAssetId: asset.fireblocksAssetId } });
    if (!existingAsset) {
      const newAsset = SupportedAsset.create({
        name: asset.name,
        fireblocksAssetId: asset.fireblocksAssetId,
        explorerUrl: asset.explorerUrl,
      });
      await newAsset.save();
      logger.info(`Added new supported asset: ${asset.name}`);
    } else {
      logger.info(`Supported asset already exists: ${asset.name}`);
    }
  }
}

export async function setupScript(): Promise<void> {
  try {
    // Check for Omnibus Vault ID
    let omnibusVaultId = process.env.OMNIBUS_VAULT;
    let omnibusVault: VaultAccount;

    if (!omnibusVaultId) {
      // Create Omnibus Vault in Fireblocks if not provided
      omnibusVault = await createVaultAccount('Omnibus Vault');
      omnibusVaultId = omnibusVault.fireblocksVaultId;
      logger.info(`Created Omnibus Vault with ID: ${omnibusVaultId}`);
    } else {
      // Use existing Omnibus Vault ID
      omnibusVault = await createVaultAccount('Omnibus Vault', omnibusVaultId);
    }

    for (const asset of supportedAssets) {
      await createOrUpdateAsset(asset.fireblocksAssetId, omnibusVault);
    }

    // Store Omnibus Vault ID in the configuration service
    vaultConfig.setOmnibusVaultId(omnibusVault.fireblocksVaultId);

    // Check for Withdrawal Vault IDs
    let withdrawalVaultIds = process.env.WITHDRAWAL_VAULTS
      ? process.env.WITHDRAWAL_VAULTS.split(',')
      : [];

    const createdWithdrawalVaultIds: string[] = [];

    // Create Withdrawal Vaults if not provided
    for (let i = 0; i < 3; i++) {
      const vaultName = `Withdrawal Vault #${i + 1}`;
      let vault: VaultAccount;

      if (withdrawalVaultIds[i]) {
        // Use existing Withdrawal Vault ID
        vault = await createVaultAccount(vaultName, withdrawalVaultIds[i]);
      } else {
        // Create new Withdrawal Vault in Fireblocks
        vault = await createVaultAccount(vaultName);
        withdrawalVaultIds[i] = vault.fireblocksVaultId;
        logger.info(`Created ${vaultName} with ID: ${vault.fireblocksVaultId}`);
      }

      for (const asset of supportedAssets) {
        await createOrUpdateAsset(asset.fireblocksAssetId, vault);
      }

      // Store each created withdrawal vault ID
      createdWithdrawalVaultIds.push(vault.fireblocksVaultId);
    }

    // Store Withdrawal Vault IDs in the configuration service
    vaultConfig.setWithdrawalVaultIds(createdWithdrawalVaultIds);

    // Create or update supported assets
    await createOrUpdateSupportedAssets();

    logger.info(`Setup completed successfully!`);
  } catch (error) {
    logger.error(`Setup failed: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
