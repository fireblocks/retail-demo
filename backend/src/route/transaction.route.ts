import { Router } from 'express';
import { TransactionController } from '@controller/transaction.controller';

const router = Router();

router.post(
  '/',
  TransactionController.initiateNewTxFlow
);

router.post(
  '/submit',
  TransactionController.createNewTransfer
);

router.get(
  '/',
  TransactionController.getTransactions
);
export default router;
