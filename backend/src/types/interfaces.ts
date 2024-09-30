import { VaultAccount } from "@model/VaultAccount";
import { Wallet } from "@model/Wallet";

export interface EndpointLimit {
  [endpoint: string]: {
    [method: string]: number;
  };
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
  outgoing?: boolean,
  isSweeping?: boolean,
  externalTxId?: string
}