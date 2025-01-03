import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateGSTFromTotal } from "@/utils/gst";

interface BasicTransactionInfoProps {
  description: string;
  setDescription: (description: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  isSubmitting: boolean;
}

export const BasicTransactionInfo = ({
  description,
  setDescription,
  amount,
  setAmount,
  isSubmitting
}: BasicTransactionInfoProps) => {
  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    setAmount(cleanValue);
  };

  const gstInfo = amount ? calculateGSTFromTotal(parseFloat(amount)) : null;

  return (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
          placeholder="Enter description"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label>Amount (MVR)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="w-full"
          placeholder="Enter final amount (including 8% GST)"
          required
          min="0"
          step="0.01"
          disabled={isSubmitting}
        />
        {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Base Amount: MVR {gstInfo?.baseAmount.toFixed(2)}</div>
            <div>GST (8%): MVR {gstInfo?.gstAmount.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
};