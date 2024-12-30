import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Product } from "@/types/product";

interface OrderCartProps {
  items: (Product & { quantity: number })[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  isSubmitting?: boolean;
}

export const OrderCart = ({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isSubmitting = false,
}: OrderCartProps) => {
  const [discount, setDiscount] = useState<number>(0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.08; // 8% GST
  const gstAmount = subtotal * gstRate;
  const finalTotal = subtotal + gstAmount - discount;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border">
      <h3 className="font-medium text-lg mb-4">Order Summary</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between pb-4 border-b">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">MVR {item.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-20 h-8"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <div className="space-y-4 pt-4">
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
                onClick={onCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "CHECKOUT"
                )}
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items in cart
          </div>
        )}
      </div>
    </div>
  );
};