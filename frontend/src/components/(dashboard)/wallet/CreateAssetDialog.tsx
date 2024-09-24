"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/foundation/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/foundation/select";
import { Button } from "@/foundation/button";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import assetStore from "../../../store/supportedAssetsStore";
import { CreateAssetProps } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { getAssetIdByName } from "@/lib/helpers";

export const CreateAsset: React.FC<CreateAssetProps> = observer(({
  open,
  close,
  onCreateClick,
}) => {
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateClick = async () => {
    if (selectedAssetName) {
      const assetId = getAssetIdByName(selectedAssetName);
      if (assetId) {
        setIsLoading(true);
        try {
          await onCreateClick(assetId);
        } catch (error) {
          console.error("Error creating asset:", error);
        } finally {
          setIsLoading(false);
          close(false);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-primary">
        <DialogHeader>
          <DialogTitle>Add an Asset</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center py-4">
          <div className="mt-4">
            <Select onValueChange={(value) => setSelectedAssetName(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {assetStore.getSupportedAssets().map((asset) => (
                    <SelectItem key={asset.id} value={asset.name}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            type="submit"
            onClick={handleCreateClick}
            disabled={isLoading || !selectedAssetName}
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
});
