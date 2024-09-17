import React, { useState } from "react";
import { Button } from "@/foundation/button";
import { Input } from "@/foundation/input";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/foundation/dialog";

export const DepositDialog = ({
  open,
  onClose,
  addresses = [], 
}: {
  open: boolean;
  onClose: () => void;
  addresses?: string[]; 
}) => {
  const [copiedStates, setCopiedStates] = useState<boolean[]>(new Array(addresses.length).fill(false));

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedStates(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        setTimeout(() => {
          setCopiedStates(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }, 3000);
      })
      .catch((err) => {
        console.error('Failed to copy address: ', err);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md md:max-w-lg lg:max-w-xl text-primary">
        <DialogHeader>
          <DialogTitle>Deposit Addresses</DialogTitle>
          <DialogClose asChild />
        </DialogHeader>
        <div className="flex flex-col space-y-2 p-4 max-h-[60vh] overflow-y-auto">
          {addresses.map((address, index) => (
            <div key={index} className="flex justify-between items-center space-x-2">
              <Input
                className="w-full text-xs md:text-sm"
                type="text"
                disabled
                value={address}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(address, index)}
              >
                {copiedStates[index] ? "Copied!" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};