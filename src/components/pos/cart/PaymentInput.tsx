import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentInputProps {
  total: number;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
}

export const PaymentInput = ({ total, paidAmount, onPaidAmountChange }: PaymentInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Label htmlFor="paidAmount" className="text-sm text-muted-foreground">
          Paid Amount
        </Label>
        <Input
          id="paidAmount"
          type="number"
          min="0"
          step="0.01"
          value={paidAmount}
          onChange={(e) => onPaidAmountChange(Number(e.target.value))}
          className="h-8"
        />
      </div>
      <div className="text-sm text-right pt-5">
        MVR {paidAmount.toFixed(2)} / {total.toFixed(2)}
      </div>
    </div>
  );
};