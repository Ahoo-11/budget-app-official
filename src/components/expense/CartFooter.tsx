import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CartFooterProps {
  total: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const CartFooter = ({ total, isSubmitting, onSubmit }: CartFooterProps) => {
  const [discount, setDiscount] = useState<number>(0);
  
  const gstRate = 0.08; // 8% GST
  const subtotal = total;
  const gstAmount = (subtotal * gstRate) / (1 + gstRate); // Calculate GST from GST-inclusive total
  const finalTotal = subtotal - discount; // Total already includes GST

  return (
    <div className="space-y-4 pt-4 border-t">
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
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="h-8"
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

        <Button
          className="w-full mt-4 bg-black text-white hover:bg-black/90"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording Purchase...
            </>
          ) : (
            "ADD TRANSACTION"
          )}
        </Button>
      </div>
    </div>
  );
};