import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ProductGridProps {
  sourceId: string;
  onProductSelect: (product: Product) => void;
}

export const ProductGrid = ({ sourceId, onProductSelect }: ProductGridProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .neq('category', 'inventory')  
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products?.map((product) => (
        <div
          key={product.id}
          className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
          onClick={() => onProductSelect(product)}
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
  );
};