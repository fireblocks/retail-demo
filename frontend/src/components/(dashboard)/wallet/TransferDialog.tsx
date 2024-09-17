"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/foundation/dialog";
import { Button } from "@/foundation/button";
import { useState } from "react";
import { TransferDialogType } from "@/lib/types";
import { Input } from "@/foundation/input";
import { Label } from "@/foundation/label";
import { Loader2 } from "lucide-react";

export const TransferDialog: React.FC<TransferDialogType> = ({
  open,
  close,
  assetId,
  balance,
  createTransaction
}) => {
  const [transactionAmount, setTransactionAmount] = useState<string | null>(null);
  const [transactionDest, setTransactionDest] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTransaction = async () => {
    if (transactionAmount && parseFloat(transactionAmount) <= parseFloat(balance)) {
      setIsLoading(true);

      await createTransaction({
        assetId,
        amount: transactionAmount,
        destination: transactionDest as string
      });
      close(false);


      setIsLoading(false);

    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setHasError(false);
      setTransactionAmount(value);
    } else {
      setHasError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-primary">
        <DialogHeader>
          <DialogTitle>Create Transfer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center py-4 text-blue-700">
          <div className="mt-4">
            <div>
              <Label>Asset ID</Label>
              <Input type="text" value={assetId} disabled />
            </div>
            <Label>Amount</Label>
            <div className="flex flex-row">
              <Input
                placeholder={`Available: ${balance}`}
                value={transactionAmount ?? ""}
                onChange={handleAmountChange}
                className={`${hasError ? "border-red-500" : ""}`}
                type="text"
                inputMode="decimal"
              />
              <Button
                variant="ghost"
                className="hover:bg-white ml-2 w-16"
                onClick={() => setTransactionAmount(balance)}
              >
                <span className="w-full text-right">Max</span>
              </Button>
            </div>
            <div>
              <Label>Destination</Label>
              <Input
                type="text"
                value={transactionDest ?? ""}
                onChange={(event) => setTransactionDest(event.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col items-stretch">
          <Button
            variant="outline"
            type="submit"
            onClick={handleCreateTransaction}
            disabled={hasError || !transactionAmount || !transactionDest || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
