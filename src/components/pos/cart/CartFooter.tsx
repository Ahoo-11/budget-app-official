import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CartFooterProps {
  subtotal: number;
  gstAmount: number;
  discount: number;
  finalTotal: number;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onCancelBill: () => void;
  selectedPayerId: string;
  isSubmitting: boolean;
  disabled: boolean;
  paymentMethod: 'cash' | 'transfer';
}

export const CartFooter = ({
  subtotal,
  gstAmount,
  discount,
  finalTotal,
  onDiscountChange,
  onCheckout,
  onCancelBill,
  selectedPayerId,
  isSubmitting,
  disabled,
  paymentMethod
}: CartFooterProps) => {
  return (
    <div className="border-t p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>MVR {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            value={discount}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span>GST (6%)</span>
          <span>MVR {gstAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-medium text-lg pt-2 border-t">
          <span>Total</span>
          <span>MVR {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={disabled || isSubmitting || !selectedPayerId}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay MVR ${finalTotal.toFixed(2)}`
          )}
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onCancelBill}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};