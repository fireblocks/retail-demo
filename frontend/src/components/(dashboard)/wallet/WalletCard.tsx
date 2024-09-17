import React from "react";
import { IconCoinBitcoin, IconCurrencyEthereum, IconCurrencySolana } from "@tabler/icons-react";
import { Button } from "@/foundation/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/foundation/card";
import { Input } from "@/foundation/input";
import { Label } from "@/foundation/label";
import { Asset, TransactionParams } from "@/lib/types";
import { useDialog } from "@/lib/hooks/useDialog";
import { formatBalance } from "@/lib/helpers";
import apiService from "@/services/api.service";
import { DepositDialog } from "./DepositDialog";
import { TransferDialog } from "./TransferDialog";
import notificationStore from "@/store/notificationStore";
import transactionStore from "@/store/transactionStore";
import walletStore from "@/store/walletStore";

export const WalletCard: React.FC<Asset> = ({ assetId, balance, addresses }) => {
  const deposit = useDialog();
  const transfer = useDialog();

  const handleCreateTransaction = async (transactionParams: TransactionParams) => {
    try {
      const result = await apiService.createTransaction(
        transactionParams.amount,
        transactionParams.assetId,
        transactionParams.destination
      );
      walletStore.updateBalance(transactionParams.assetId, parseFloat(transactionParams.amount) * -1)
      notificationStore.addNotification(
        `Transaction created successfully for ${assetId}:
        Amount: ${transactionParams.amount}
        Destination: ${transactionParams.destination}
        Transaction ID: ${result.txId}
        Status: ${result.status}`
      );
      transactionStore.addTransaction({
        amount: transactionParams.amount,
        assetId: transactionParams.assetId,
        id: "",
        fireblocksTxId: result.id,
        status: result.status,
        txHash: "",
        destinationExternalAddress: transactionParams.destination,
        createdAt: Date.now()
      })
      walletStore.updateOutgoingBalance(transactionParams.assetId, parseFloat(transactionParams.amount));

    } catch (error) {
      console.error("Transaction failed:", error);
      notificationStore.addNotification(`Transaction failed for ${assetId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderIcon = () => {
    switch (assetId) {
      case 'BTC_TEST':
        return <IconCoinBitcoin size={100} color="#2563eb" />;
      case 'ETH_TEST5':
        return <IconCurrencyEthereum size={100} color="#2563eb" />;
      case 'SOL_TEST':
        return <IconCurrencySolana size={100} color="#2563eb" />;
      default:
        return <IconCoinBitcoin size={100} color="#2563eb" />;
    }
  };

  return (
    <Card className="w-[300px] text-primary">
      <CardHeader>
        <CardTitle className="flex justify-center">
          {renderIcon()}
        </CardTitle>
        <CardDescription className="flex justify-center">{assetId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col text-center items-center space-y-1.5">
          <Label htmlFor="balance">Balance</Label>
          <Input
            id="balance"
            className="w-20 text-center"
            type="text"
            disabled
            value={formatBalance(balance)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={deposit.toggle}>Deposit</Button>
        <DepositDialog open={deposit.isOpen} onClose={deposit.toggle} addresses={addresses} />
        <Button onClick={transfer.toggle} disabled={parseFloat(balance) <= 0}>Transfer</Button>
        <TransferDialog
          assetId={assetId}
          open={transfer.isOpen}
          close={transfer.toggle}
          balance={balance}
          createTransaction={handleCreateTransaction}
        />
      </CardFooter>
    </Card>
  );
};