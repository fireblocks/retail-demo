"use client";

import { observer } from "mobx-react-lite";
import { useState } from "react";
import { WalletCard } from "@/components/(dashboard)/wallet/WalletCard";
import { CreateAsset } from "@/components/(dashboard)/wallet/CreateAssetDialog";
import { Button } from "@/foundation/button";
import walletStore from "@/store/walletStore";
import terminalStore from "@/store/terminalStore";
import { Asset } from "@/lib/types";

const WalletsPage = observer(() => {
  const [isAddWalletOpen, setAddWalletOpen] = useState(false);

  const handleCreateWalletClick = () => {
    setAddWalletOpen((prev) => !prev);
  };

  const handleCreateNewAsset = async (asset: string): Promise<void> => {
    try {
      console.log("User wallet ID:", walletStore.wallet.id)
      const res = await walletStore.createWalletAsset(walletStore.wallet.id, asset);
      let message = "\n\n" + new Date().toISOString() + `: Created a new ${asset} asset in the user's wallet in the following vault account ID: ${res.vaultAccountId}. The address is: ${res.address}.`
      if (asset === "BTC_TEST") {
        message += "\nSince this is a BTC address, we use the a single vault account for all of our users and each user gets an address/multiple addresses in this single vault account."
      }
      terminalStore.addLog(message)
      setAddWalletOpen(false);
    } catch (error) {
      console.error("Error creating wallet:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center ml-10">
        <Button
          variant="default"
          className="flex items-center hover:text-primary hover:bg-blue-100 text-white"
          onClick={handleCreateWalletClick}
        >
          <p>Add an Asset</p>
        </Button>
      </div>
      <div className="flex-grow flex flex-col items-center">
        <CreateAsset
          open={isAddWalletOpen}
          close={setAddWalletOpen}
          onCreateClick={handleCreateNewAsset}
        />
        <div className="w-full flex justify-center mt-10">
          {walletStore.wallet?.assets && walletStore.wallet.assets.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 max-w-5xl">
              {walletStore.wallet.assets.map((asset: Asset) => (
                <WalletCard key={asset.assetId} {...asset} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>You have no assets!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default WalletsPage;

