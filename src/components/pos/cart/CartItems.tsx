import { BillProduct } from "@/types/bills";

interface CartItemsProps {
  products: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItems = ({
  products,
  onUpdateQuantity,
  onRemove,
}: CartItemsProps) => {
  if (!products || !products.length) {
    return (
      <div className="flex-1 p-4 text-center text-muted-foreground">
        No items in cart
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {products.map((product) => (
        <div key={product.product_id} className="flex justify-between items-center p-2 border rounded-lg">
          <div>
            <h4 className="font-medium">{product.product.name}</h4>
            <p className="text-sm text-muted-foreground">
              MVR {product.unit_price.toFixed(2)} × {product.quantity}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) => onUpdateQuantity(product.product_id, parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 border rounded"
            />
            <button
              onClick={() => onRemove(product.product_id)}
              className="p-1 text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};