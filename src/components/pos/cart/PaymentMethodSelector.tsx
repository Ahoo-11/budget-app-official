import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreditCard, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
  method: 'cash' | 'transfer';
  onMethodChange: (method: 'cash' | 'transfer') => void;
}

export const PaymentMethodSelector = ({ method, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Payment Method</label>
      <ToggleGroup
        type="single"
        value={method}
        onValueChange={(value) => {
          if (value) onMethodChange(value as 'cash' | 'transfer');
        }}
        className="justify-start"
      >
        <ToggleGroupItem
          value="cash"
          aria-label="Cash payment"
          className={`flex items-center gap-2 ${
            method === 'cash' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
          }`}
        >
          <Banknote className="h-4 w-4" />
          Cash
        </ToggleGroupItem>
        <ToggleGroupItem
          value="transfer"
          aria-label="Transfer payment"
          className={`flex items-center gap-2 ${
            method === 'transfer' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Transfer
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};