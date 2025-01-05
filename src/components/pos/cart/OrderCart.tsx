import { useEffect, useState } from "react";
import { BillProduct } from "@/types/bills";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OrderCartProps {
  selectedProducts: BillProduct[];
  onUpdate: (products: BillProduct[]) => void;
}

export const OrderCart = ({ selectedProducts, onUpdate }: OrderCartProps) => {
  const [products, setProducts] = useState<BillProduct[]>(selectedProducts);

  useEffect(() => {
    setProducts(selectedProducts);
  }, [selectedProducts]);

  const handleRemoveProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    onUpdate(updatedProducts);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, quantity } : product
    );
    setProducts(updatedProducts);
    onUpdate(updatedProducts);
  };

  return (
    <div className="space-y-4">
      {products.map(product => (
        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <p>Price: MVR {product.price.toFixed(2)}</p>
            <p>Quantity: 
              <input 
                type="number" 
                value={product.quantity} 
                onChange={(e) => handleUpdateQuantity(product.id, Number(e.target.value))}
                min="1"
                className="w-16 border rounded"
              />
            </p>
          </div>
          <Button variant="destructive" onClick={() => handleRemoveProduct(product.id)}>
            Remove
          </Button>
        </div>
      ))}
      {products.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No products in the cart
        </div>
      )}
    </div>
  );
};
