import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductSearch } from "./ProductSearch";
import { ExpenseCart } from "./ExpenseCart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "../products/ProductForm";

interface ExpenseInterfaceProps {
  sourceId: string;
}

export const ExpenseInterface = ({ sourceId }: ExpenseInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number, purchase_price: number })[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

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

  const handleProductAdd = () => {
    setIsAddingProduct(false);
    // The products query will automatically refetch
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 space-y-4">
        <div className="flex justify-between items-center">
          <ProductSearch 
            products={products} 
            onSelect={handleProductSelect}
          />
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm 
                sourceId={sourceId} 
                onSuccess={handleProductAdd}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-left space-y-2"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                Current Stock: {product.current_stock} {product.unit_of_measurement}
              </div>
              <div className="text-sm text-muted-foreground">
                Last Purchase: ${product.purchase_cost}
              </div>
            </button>
          ))}
        </div>
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