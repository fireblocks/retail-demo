import { AppDataSource } from './data-source';
import { VaultAccount } from '@model/VaultAccount';
import { Asset } from '@model/Asset';
import { VaultAccountService } from '@service/fireblocks/vaultAccount.service';
import 'dotenv/config';

const vaultAccountService = new VaultAccountService();

async function createVaultAccount(name: string, existingId?: string): Promise<VaultAccount> {
  let vaultAccount = await VaultAccount.findOne({ where: { name } });
  
  if (!vaultAccount) {
    if (existingId) {
      vaultAccount = VaultAccount.create({ fireblocksVaultId: existingId, name });
      console.log(`Created ${name} vault account in DB only`)
    } else {
      const response = await vaultAccountService.createVaultAccount(name);
      vaultAccount = VaultAccount.create({ fireblocksVaultId: response.id, name });
      console.log(`Created ${name} vault account in DB and Fireblocks`)
    }
    await vaultAccount.save();
  }
  console.log(`${name} vault account exists in DB and Fireblocks. Ignoring.`)
  return vaultAccount;
}

async function createOrUpdateAsset(assetId: string, vaultAccount: VaultAccount): Promise<void> {
  let existingAsset = await Asset.findOne({ where: { assetId, vaultAccount: { id: vaultAccount.id } } });
  
  if (!existingAsset) {
    try {
      const assetBalance = await vaultAccountService.getVaultWalletBalance(vaultAccount.fireblocksVaultId, assetId);
      
      if (assetBalance) {
        // Asset exists in Fireblocks, fetch its address
        const addressesResponse = await vaultAccountService.getAddresses(vaultAccount.fireblocksVaultId, assetId);
        const address = addressesResponse.addresses && addressesResponse.addresses.length > 0
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
        const newAddress = await vaultAccountService.createVaultWallet(vaultAccount.fireblocksVaultId, assetId);
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
      console.error(`Error creating/updating asset ${assetId} for vault ${vaultAccount.fireblocksVaultId}:`, error);
    }
  }
}

export async function setupScript(): Promise<void> {
  try {
    await AppDataSource.initialize();
    
    const omnibusVaultId = process.env.OMNIBUS_VAULT;
    const withdrawalVaultIds = process.env.WITHDRAWAL_VAULTS ? process.env.WITHDRAWAL_VAULTS.split(',') : [];
    
    // Create Omnibus Vault
    const omnibusVault = await createVaultAccount("Omnibus Vault", omnibusVaultId);
    await createOrUpdateAsset("BTC_TEST", omnibusVault);
    
    // Create Withdrawal Vaults
    for (let i = 0; i < 3; i++) {
      const vaultName = `Withdrawal Vault #${i + 1}`;
      const vault = await createVaultAccount(vaultName, withdrawalVaultIds[i]);
      await createOrUpdateAsset("SOL_TEST", vault);
      await createOrUpdateAsset("ETH_TEST5", vault);
      await createOrUpdateAsset("BTC_TEST", vault);
    }
    
    console.log("Setup completed successfully");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}