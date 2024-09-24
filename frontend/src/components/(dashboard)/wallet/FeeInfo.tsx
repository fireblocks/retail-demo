import { Label } from "@/foundation/label"
import { RadioGroup, RadioGroupItem } from "@/foundation/radio-group"

export const FeeInfo = ({ feeInfo, setTxLevel, assetId }: { feeInfo: any, setTxLevel: (feeLevel: string) => void, assetId: string } ) => {
  return (
    <>
      <Label htmlFor="rg">Transaction Fee Levels:</Label>
      <RadioGroup className='text-gray-500' defaultValue="medium" id="rg" onValueChange={setTxLevel}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="low" id="r1" />
          <Label htmlFor="r1">Low: ~{feeInfo.low.networkFee} {assetId}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medium" id="r2" />
          <Label htmlFor="r2">Medium: ~{feeInfo.medium.networkFee} {assetId}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="high" id="r3" />
          <Label htmlFor="r3">High: ~{feeInfo.high.networkFee} {assetId}</Label>
        </div>
      </RadioGroup>
    </>

  );
};