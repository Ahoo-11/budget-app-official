import { PaymentMethod } from "@/types/bills";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethodSelectorProps {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({
  method,
  onChange,
}: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Payment Method</label>
      <Select value={method} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="transfer">Bank Transfer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
