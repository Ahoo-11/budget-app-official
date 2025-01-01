import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BillProduct } from "@/types/bill";

interface CartItemsProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItems = ({ items, onUpdateQuantity, onRemove }: CartItemsProps) => {
  return (
    <div className="flex-1 overflow-auto p-4">
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

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items in cart
          </div>
        )}
      </div>
    </div>
  );
};