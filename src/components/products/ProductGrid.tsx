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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return (data as Product[]).map(product => ({
        ...product,
        product_type: product.product_type as 'basic' | 'composite'
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
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
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick ? () => onProductClick(product) : undefined}
          />
        ))}
      </div>

      <Dialog 
        open={isAddingProduct} 
        onOpenChange={setIsAddingProduct}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingProduct(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!editingProduct} 
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              sourceId={sourceId}
              product={editingProduct}
              onSuccess={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};