import { BillProduct } from '@/types/bills';
import { useCart } from '@/hooks/cart/useCart';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export const CartItems = () => {
  const { cartItems, removeFromCart, updateCartItemQuantity } = useCart();

  if (cartItems.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No items in the cart</div>;
  }

  return (
    <div className="space-y-4">
      {cartItems.map((item: BillProduct) => (
        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-muted-foreground">MVR {item.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </Button>
            <span>{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
            >
              +
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
