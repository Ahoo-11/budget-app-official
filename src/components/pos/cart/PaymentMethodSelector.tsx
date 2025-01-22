import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodSelectorProps {
  method: 'cash' | 'transfer';
  onMethodChange: (method: 'cash' | 'transfer') => void;
}

export const PaymentMethodSelector = ({
  method,
  onMethodChange
}: PaymentMethodSelectorProps) => {
  return (
    <RadioGroup
      value={method}
      onValueChange={onMethodChange}
      className="flex space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="cash" id="cash" />
        <Label htmlFor="cash">Cash</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="transfer" id="transfer" />
        <Label htmlFor="transfer">Transfer</Label>
      </div>
    </RadioGroup>
  );
};