import { Router } from 'express';
import { WalletController } from '@controller/wallet.controller';

const router = Router();

router.get(
  '/',
  WalletController.getUserAssets
);


router.post(
  '/',
  WalletController.createUserWallet
)
router.post(
  '/:walletId/assets',
  WalletController.createAssetInWallet
)

export default router;
