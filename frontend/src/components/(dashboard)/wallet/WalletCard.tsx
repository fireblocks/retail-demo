import React from "react";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import { IconCoinBitcoin, IconCurrencyEthereum, IconCurrencySolana } from "@tabler/icons-react";
import { Button } from "@/foundation/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/foundation/card";
import { Input } from "@/foundation/input";
import { Label } from "@/foundation/label";
import { Asset, TransactionParams } from "@/lib/types";
import { useDialog } from "@/lib/hooks/useDialog";
import { formatBalance, getAssetNameById } from "@/lib/helpers";
import apiService from "@/services/api.service";
import { DepositDialog } from "./DepositDialog";
import { TransferDialog } from "./TransferDialog";
import notificationStore from "@/store/notificationStore";
import transactionStore from "@/store/transactionStore";
import walletStore from "@/store/walletStore";

export const WalletCard: React.FC<Asset> = observer(({ assetId, addresses }) => {
  const deposit = useDialog();
  const transfer = useDialog();

  React.useEffect(() => {
    const disposer = reaction(
      () => walletStore.getAssetBalance(assetId),
      (balance) => console.log(`Balance for ${assetId} changed to:`, balance)
    );
    return () => disposer();
  }, [assetId]);

  const balance = walletStore.getAssetBalance(assetId);

  const handleCreateTransaction = async (transactionParams: TransactionParams) => {
    try {
      console.log("In handle create transaction!")
      const result = await apiService.createTransaction(
        transactionParams.amount,
        transactionParams.assetId,
        transactionParams.destination,
        transactionParams.feeLevel as string,
      );
      // Use a negative amount for outgoing transactions
      walletStore.updateOutgoingBalance(transactionParams.assetId, parseFloat(transactionParams.amount));
      
      notificationStore.addNotification(
        'New Outgoing Transaction',
        `Amount:       ${transactionParams.amount}
        Destination:  ${transactionParams.destination}
        Transaction ID: ${result.id}
        Status: ${result.status}`
      );

      transactionStore.addTransaction({
        amount: transactionParams.amount,
        assetId: transactionParams.assetId,
        id: "",
        fireblocksTxId: result.fireblocksTxId,
        status: result.status,
        txHash: "",
        destinationExternalAddress: transactionParams.destination,
        createdAt: Date.now(),
        outgoing: true
      })
    } catch (error) {
      console.error("Transaction failed:", error);
      notificationStore.addNotification(
      'New Transaction', 
      `Transaction failed for ${assetId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    }
  };

  const renderIcon = () => {
    switch (assetId) {
      case 'BTC_TEST':
        return <IconCoinBitcoin size={100} color="#2563eb" strokeWidth="1" />;
      case 'ETH_TEST5':
        return <IconCurrencyEthereum size={100} color="#2563eb" strokeWidth="1"/>;
      case 'SOL_TEST':
        return <IconCurrencySolana size={100} color="#2563eb" strokeWidth="1" />;
      default:
        return <IconCoinBitcoin size={100} color="#2563eb" strokeWidth="1" />;
    }
  };

  return (
    <Card className="w-[300px] text-primary drop-shadow shadow-xl shadow-blue-200 border-blue-100">
      <CardHeader className="pb-0 relative overflow-hidden h-40 flex flex-col justify-between rounded-t-lg bg-gradient-to-r from-white to-blue-400">
        <div className="absolute left-1/8 top-1/4 transform -translate-x-1/2 -translate-y-1/2" style={{ transform: 'rotate(-20deg) scale(3.5)' }}>
          {renderIcon()}
        </div>
        <div className="h-8" /> {/* Spacer */}
        <CardTitle className="z-10 relative mb-2 w-full ml-4">
          <CardDescription className="flex justify-end text-white text-xl">
            {getAssetNameById(assetId)}
          </CardDescription>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col text-center items-center space-y-1.5 mt-4">
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
});