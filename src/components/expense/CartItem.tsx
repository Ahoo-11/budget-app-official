import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  product: Product & { quantity: number; purchase_price: number };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({
  product,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}: CartItemProps) => {
  return (
    <div className="py-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">
            Current Stock: {product.current_stock} {product.unit_of_measurement}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            min="1"
            value={product.quantity}
            onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={product.purchase_price}
            onChange={(e) => onUpdatePrice(product.id, parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="text-right text-sm">
        Subtotal: ${(product.quantity * product.purchase_price).toFixed(2)}
      </div>
    </div>
  );
};