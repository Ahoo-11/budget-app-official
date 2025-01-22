import { RadioGroup } from "@headlessui/react";
import { Button } from "@/components/ui/button";

interface PaymentMethodSelectorProps {
  method: 'cash' | 'transfer';
  onMethodChange: (method: 'cash' | 'transfer') => void;
}

export const PaymentMethodSelector = ({ method, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <RadioGroup value={method} onChange={onMethodChange} className="flex space-x-4">
      <RadioGroup.Option value="cash" className={({ checked }) => `flex items-center p-2 border rounded-lg ${checked ? 'bg-accent' : 'bg-background'}`}>
        {({ checked }) => (
          <>
            <span className="mr-2">Cash</span>
            {checked && <span className="text-green-500">✓</span>}
          </>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="transfer" className={({ checked }) => `flex items-center p-2 border rounded-lg ${checked ? 'bg-accent' : 'bg-background'}`}>
        {({ checked }) => (
          <>
            <span className="mr-2">Transfer</span>
            {checked && <span className="text-green-500">✓</span>}
          </>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
};
