import { VaultAccount } from "@model/VaultAccount";
import { Wallet } from "@model/Wallet";

export enum WebhookEvents {
  'NewTransactionCreated' = 'TRANSACTION_CREATED',
  'TransactionStatusUpdated' = 'TRANSACTION_STATUS_UPDATED',
}


export interface DBTransaction {
  wallet: Wallet,
  amount: string,
  assetId: string,
  fireblocksTxId: string,
  status: string,
  txHash?: string,
  sourceVaultAccount?: VaultAccount | "",
  destinationVaultAccount?: VaultAccount | "",
  sourceExternalAddress?: string,
  destinationExternalAddress?: string,
  createdAt: string,
  outgoing?: boolean
}