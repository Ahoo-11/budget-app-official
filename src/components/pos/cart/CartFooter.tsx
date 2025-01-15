import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartFooterProps {
  subtotal: number;
  gstAmount: number;
  discount: number;
  finalTotal: number;
  isSubmitting?: boolean;
  disabled?: boolean;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onCancelBill: () => void;
  selectedPayerId?: string | null;
}

export const CartFooter = ({
  subtotal,
  gstAmount,
  discount,
  finalTotal,
  isSubmitting = false,
  disabled = false,
  onDiscountChange,
  onCheckout,
  onCancelBill,
  selectedPayerId,
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
            <Label htmlFor="discount" className="text-sm text-muted-foreground">Discount</Label>
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
          <span>MVR {finalTotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={disabled}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Bill
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Bill</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this bill? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Bill</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancelBill}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, cancel bill
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="flex-1 bg-black text-white hover:bg-black/90"
            onClick={onCheckout}
            disabled={isSubmitting || disabled}
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