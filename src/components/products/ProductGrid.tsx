import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProductForm } from "./ProductForm";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductGridProps {
  sourceId: string;
  onProductClick?: (product: Product) => void;
}

export const ProductGrid = ({ sourceId, onProductClick }: ProductGridProps) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Products</h3>
        <Button onClick={() => setIsAddingProduct(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {products?.map((product) => (
          <div
            key={product.id}
            className={onProductClick ? "cursor-pointer" : undefined}
            onClick={() => onProductClick?.(product)}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingProduct(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};