import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { ExpenseCart } from "./ExpenseCart";
import { ProductCard } from "../products/ProductCard";

interface ExpenseInterfaceProps {
  sourceId: string;
}

export const ExpenseInterface = ({ sourceId }: ExpenseInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setSearchQuery("");
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Add Items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {searchQuery && (
          <div className="border rounded-lg divide-y">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="w-full p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current Stock: {product.current_stock} {product.unit_of_measurement}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last Purchase: ${product.purchase_cost?.toFixed(2) || '0.00'}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <div className="bg-accent/50 p-4 rounded-lg mb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="font-medium">Item</th>
                    <th className="font-medium">Type</th>
                    <th className="font-medium text-right">Amount</th>
                    <th className="font-medium text-right">Qty</th>
                    <th className="font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="py-2">{product.name}</td>
                      <td>Product</td>
                      <td className="text-right">${product.purchase_price.toFixed(2)}</td>
                      <td className="text-right">{product.quantity}</td>
                      <td className="text-right">${(product.purchase_price * product.quantity).toFixed(2)}</td>
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
              prev.map(p => (p.id === productId ? { ...p, quantity } : p))
            );
          }}
          onUpdatePrice={(productId, price) => {
            setSelectedProducts(prev =>
              prev.map(p => (p.id === productId ? { ...p, purchase_price: price } : p))
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