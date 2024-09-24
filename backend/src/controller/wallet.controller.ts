import { Request, Response } from 'express';
import { VaultAccount } from '@model/VaultAccount';
import { User } from '@model/User';
import { Asset } from '@model/Asset';
import { SupportedAsset } from '@model/SupportedAsset';
import { fireblocksVaultAccountService } from '@service/fireblocks/';
import { Wallet } from '@model/Wallet';
import { isUTXO } from '../utils/utxo.utils';
import { createLogger } from '@util/logger.utils';
import { vaultConfig } from '@util/vaultConfig';

const logger = createLogger('<Wallet Controller>');

export class WalletController {
  static async getUserAssets(req: Request, res: Response) {
    try {
      const user = req.user as User;

      logger.info(`Going to get user wallet for user: ${user.id}`);

      const wallet = await Wallet.find({
        where: { user: { id: user.id } },
        relations: ['assets', 'assets.vaultAccount', 'assetBalances'],
      });

      logger.info(`In get user wallet: ${JSON.stringify(wallet)}`);
      const walletData = wallet.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        assetBalances: wallet.assetBalances,
        assets: wallet.assets.map((asset) => ({
          assetId: asset.assetId,
          address: asset.address,
          vaultAccountId: asset.vaultAccount.fireblocksVaultId,
        })),
      }));

      res.status(200).json(walletData);
    } catch (error) {
      logger.error(`Error fetching user wallets: ${JSON.stringify(error)}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getSupportedAssets(req: Request, res: Response) {
    const assets = await SupportedAsset.find();
    return res.status(200).send(assets);
  }

  static async createAssetInWallet(req: Request, res: Response) {
    logger.info('In create new asset!');
    try {
      const { walletId } = req.params;
      const { assetId } = req.body;

      const wallet = await Wallet.findOne({
        where: { id: walletId },
        relations: ['user', 'assets'],
      });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      const newAsset = await handleAssetCreation(
        wallet,
        assetId,
        req.user as User
      );

      const { address, balance, vaultAccount } = newAsset;
      logger.info(`Created a new asset: ${JSON.stringify(newAsset)}`);
      res.status(200).send({
        assetId: newAsset.assetId,
        address,
        balance,
        vaultAccountId: vaultAccount.fireblocksVaultId,
      });
    } catch (error) {
      logger.error(`Error creating asset in wallet: ${JSON.stringify(error)}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static createUserWallet = async (req: Request, res: Response) => {
    const user: User = req.user as User;
    logger.info(`Got a request to create a new wallet for user: ${user}`);
    const wallet = Wallet.create({
      name: user.name,
      assets: [],
      assetBalances: [],
      description: `${user.id} wallet`,
      user,
    });

    await wallet.save();
    res.status(200).send([{ ...wallet }]);
  };
}

async function handleAssetCreation(
  wallet: Wallet,
  assetId: string,
  user: User
): Promise<Asset> {
  const vaultAccount = await determineVaultAccount(wallet, assetId);
  let newAddress: any;

  if (isUTXO(assetId)) {
    newAddress = await fireblocksVaultAccountService.createDepositAddress(
      vaultAccount.fireblocksVaultId,
      assetId,
      user.id
    );
  } else {
    newAddress = await fireblocksVaultAccountService.createVaultWallet(
      vaultAccount.fireblocksVaultId,
      assetId
    );
  }

  const newAsset = Asset.create({
    assetId,
    assetName: assetId === 'BTC' ? 'Bitcoin' : assetId,
    address: newAddress.address,
    balance: 0,
    vaultAccount,
    wallet,
  });
  await newAsset.save();
  return newAsset;
}

async function determineVaultAccount(
  wallet: Wallet,
  assetId: string
): Promise<VaultAccount> {
  logger.info('In determine vault account');
  const omnibusVaultAccountId = vaultConfig.getOmnibusVaultId();
  // Handle UTXO assets
  if (isUTXO(assetId)) {
    logger.info('Asset is a UTXO asset');
    const omniVaultAccount = await VaultAccount.findOne({
      where: { fireblocksVaultId: omnibusVaultAccountId },
    });

    if (!omniVaultAccount) {
      throw new Error('Omnibus vault account not found.');
    }
    logger.info('returning omnibus vault account');
    return omniVaultAccount;
  }

  // Handle non-UTXO assets
  const existingAssets = await Asset.find({
    where: { wallet: { id: wallet.id } },
    relations: ['vaultAccount'],
  });

  // Check if there's a vault account without the requested asset
  for (const asset of existingAssets) {
    if (asset.assetId === assetId) {
      // If the asset already exists in a vault account, skip it
      continue;
    }

    const assetsInVault = await Asset.find({
      where: {
        vaultAccount: { id: asset.vaultAccount.id },
        assetId: assetId,
      },
    });

    if (assetsInVault.length === 0) {
      // Found a vault account without the requested asset
      console.log("Found an existing vault account without the requested asset:", asset.vaultAccount.fireblocksVaultId)
      return asset.vaultAccount;
    }
  }

  // If no suitable vault account found, create a new one
  const newVaultAccountResponse =
    await fireblocksVaultAccountService.createVaultAccount(wallet.user.id);

  const newVaultAccount = VaultAccount.create({
    fireblocksVaultId: newVaultAccountResponse.id,
    name: `${wallet.user.name}'s Vault for ${assetId}`,
  });

  await newVaultAccount.save();
  console.log("Created a new vault account:", newVaultAccount.fireblocksVaultId)
  return newVaultAccount;
}
