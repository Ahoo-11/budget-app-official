import { BillProduct } from "@/types/bills";
import { Button } from "@/components/ui/button";

interface CartItemsProps {
  selectedProducts: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItems = ({
  selectedProducts,
  onUpdateQuantity,
  onRemove,
}: CartItemsProps) => {
  return (
    <div className="space-y-4">
      {selectedProducts.map((product) => (
        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <p>Price: MVR {product.price.toFixed(2)}</p>
            <p>Quantity: {product.quantity}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
            >
              +
            </Button>
            <Button
              variant="outline"
              onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
              disabled={product.quantity <= 1}
            >
              -
            </Button>
            <Button
              variant="destructive"
              onClick={() => onRemove(product.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
