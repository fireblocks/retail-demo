import { Router } from 'express';
import { WalletController } from '@controller/wallet.controller';

const router = Router();

router.get(
  '/',
  WalletController.getSupportedAssets
);

export default router;
