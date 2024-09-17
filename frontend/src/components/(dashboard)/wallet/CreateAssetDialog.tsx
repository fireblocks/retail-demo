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
import assetStore from "../../../store/supportedAssetsStore";
import { useState } from "react";
import { CreateAssetProps } from "@/lib/types";
import { Loader2 } from "lucide-react";

export const CreateAsset: React.FC<CreateAssetProps> = ({
  open,
  close,
  onCreateClick,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateClick = async () => {
    if (selectedAssetId) {
      setIsLoading(true);
      try {
        await onCreateClick(selectedAssetId);
      } catch (error) {
        console.error("Error creating asset:", error);
        // Optionally, you can add error handling here (e.g., show an error message)
      } finally {
        setIsLoading(false);
        close(false);
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
            <Select onValueChange={(value) => setSelectedAssetId(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {assetStore.getSupportedAssets().map((asset) => {
                    return (
                      <SelectItem key={asset.assetId} value={asset.assetId}>
                        {asset.assetId}
                      </SelectItem>
                    );
                  })}
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
            disabled={isLoading || !selectedAssetId}
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
