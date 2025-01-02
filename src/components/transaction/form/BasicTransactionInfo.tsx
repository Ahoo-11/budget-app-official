import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
          placeholder="Enter amount"
          required
          min="0"
          step="0.01"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};