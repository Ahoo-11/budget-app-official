import { useState } from "react";
import { Product } from "@/types/product";
import { ProductGrid } from "../products/ProductGrid";
import { OrderCart } from "./OrderCart";

interface OrderInterfaceProps {
  sourceId: string;
  type: "income" | "expense";
}

export const OrderInterface = ({ sourceId, type }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number })[]>([]);

  const addToCart = (product: Product) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <ProductGrid sourceId={sourceId} onProductClick={addToCart} />
      </div>
      <div className="col-span-4">
        <OrderCart
          products={selectedProducts}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          sourceId={sourceId}
          type={type}
        />
      </div>
    </div>
  );
};