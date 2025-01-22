import { BillProduct } from "@/types/bills";

interface CartItemsProps {
  selectedProducts: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItems = ({
  selectedProducts,
  onUpdateQuantity,
  onRemove
}: CartItemsProps) => {
  return (
    <div className="flex-1 overflow-auto p-4">
      {selectedProducts.map((product) => (
        <div key={product.id} className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">MVR {product.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value) || 1)}
              className="w-20 rounded border p-1"
            />
            <button
              onClick={() => onRemove(product.id)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};