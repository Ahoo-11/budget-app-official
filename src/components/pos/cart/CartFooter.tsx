import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CartFooterProps {
  subtotal: number;
  gstAmount: number;
  discount: number;
  finalTotal: number;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onCancelBill: () => void;
  selectedPayerId?: string | null;
  isSubmitting: boolean;
  disabled?: boolean;
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
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>MVR {subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">GST (8%)</span>
          <span>MVR {gstAmount.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="discount" className="text-sm text-muted-foreground">Discount</label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              className="h-8"
              disabled={disabled}
            />
          </div>
          <div className="text-sm text-right pt-5">
            MVR {discount.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t">
        <div className="flex justify-between items-center font-medium text-lg">
          <span>Total</span>
          <span className={paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'}>
            MVR {finalTotal.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onCancelBill}
            disabled={disabled}
          >
            Cancel Bill
          </Button>

          <Button
            className={`flex-1 ${
              paymentMethod === 'cash' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onCheckout}
            disabled={isSubmitting || disabled || (!selectedPayerId && paymentMethod === 'transfer')}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              selectedPayerId ? "CHARGE TO ACCOUNT" : "CHECKOUT"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};