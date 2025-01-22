import { Product } from "@/types/product";
import { Grid } from "@/components/ui/grid";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  sourceId: string;
  products?: Product[];
  onSelect: (product: Product) => void;
}

export const ProductGrid = ({ sourceId, products, onSelect }: ProductGridProps) => {
  console.log('ProductGrid received products:', products);

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <Grid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onSelect(product)}
        />
      ))}
    </Grid>
  );
};