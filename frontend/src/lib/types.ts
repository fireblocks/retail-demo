export type Asset = {
  assetId: string;
  balance: string;
  addresses: string[] | undefined;
  pendingIncomingBalance: string,
  pendingOutgoingBalance: string
};


export type Wallet = {
  assets: Asset[]| null,
  id: string | null
};

interface DialogProps {
  open: boolean;
  close: (isOpen: boolean) => void;
}


export interface TransferDialogType extends DialogProps {
  assetId: string,
  balance: string,
  createTransaction: (TransactionParams: TransactionParams) => void;
}

export interface CreateAssetProps extends DialogProps {
  onCreateClick: (assetId: string) => Promise<void>;
}

export interface TransactionParams {
  amount: string,
  assetId: string,
  destination: string,
  feeLevel?: string
}

export interface User {
  id: string;
  name: string;
  email: string;
}
