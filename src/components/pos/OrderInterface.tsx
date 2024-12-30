import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "../expense/ItemSearch";
import { ProductGrid } from "../products/ProductGrid";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as Product[];
    }
  });

  const handleProductSelect = (product: Product) => {
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

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Implement checkout logic here
      console.log('Processing checkout:', selectedProducts);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-7">
        <div className="space-y-4">
          <ItemSearch
            products={products}
            onSelect={handleProductSelect}
            sourceId={sourceId}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
                onClick={() => handleProductSelect(product)}
              >
                <div className="aspect-square relative mb-2">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-sm text-muted-foreground">MVR {product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-5">
        <OrderCart
          items={selectedProducts}
          onUpdateQuantity={(productId, quantity) => {
            setSelectedProducts(prev =>
              prev.map(p => p.id === productId ? { ...p, quantity } : p)
            );
          }}
          onRemove={(productId) => {
            setSelectedProducts(prev => prev.filter(p => p.id !== productId));
          }}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};