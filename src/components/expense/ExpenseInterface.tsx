import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ExpenseCart } from "./ExpenseCart";
import { ItemSearch } from "./ItemSearch";

interface ExpenseInterfaceProps {
  sourceId: string;
}

export const ExpenseInterface = ({ sourceId }: ExpenseInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number; purchase_price: number })[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
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
      return [...prev, { 
        ...product, 
        quantity: 1,
        purchase_price: product.purchase_cost || 0
      }];
    });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <ItemSearch
          products={products}
          onSelect={handleProductSelect}
          sourceId={sourceId}
        />

        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <div className="bg-accent/50 p-4 rounded-lg mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left font-medium">Item</th>
                    <th className="py-2 px-4 text-right font-medium">Amount</th>
                    <th className="py-2 px-4 text-right font-medium">Qty</th>
                    <th className="py-2 px-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="py-2 px-4 text-right">
                        ${product.purchase_price.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {product.quantity}
                      </td>
                      <td className="py-2 px-4 text-right">
                        ${(product.purchase_price * product.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-4">
        <ExpenseCart
          products={selectedProducts}
          onUpdateQuantity={(productId, quantity) => {
            setSelectedProducts(prev =>
              prev.map(p => p.id === productId ? { ...p, quantity } : p)
            );
          }}
          onUpdatePrice={(productId, price) => {
            setSelectedProducts(prev =>
              prev.map(p => p.id === productId ? { ...p, purchase_price: price } : p)
            );
          }}
          onRemove={(productId) => {
            setSelectedProducts(prev => prev.filter(p => p.id !== productId));
          }}
          sourceId={sourceId}
        />
      </div>
    </div>
  );
};