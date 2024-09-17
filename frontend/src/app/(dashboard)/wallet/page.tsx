"use client";

import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Wallets as WalletsComponent } from "@/components/(dashboard)/wallet/Wallets";
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
    <>
      <div className="flex justify-between items-center w-full px-10 py-5">
        <Button
          variant="outline"
          className="flex items-center hover:scale-105 hover:text-primary text-primary"
          onClick={handleCreateWalletClick}
        >
          <p>Add an Asset</p>
        </Button>

        <CreateAsset
          open={isAddWalletOpen}
          close={setAddWalletOpen}
          onCreateClick={handleCreateNewAsset}
        />
      </div>
      <div>
        {walletStore.wallet?.assets && walletStore.wallet.assets.length > 0 ? (
          <WalletsComponent assets={walletStore.wallet.assets as Asset[]} />
        ) : (
          <div>You have no assets!</div>
        )}
      </div>
    </>

  );
});

export default WalletsPage;

