import { ProductGrid } from "@/components/products/ProductGrid";

interface ProductsListProps {
  sourceId: string;
}

export const ProductsList = ({ sourceId }: ProductsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
      </div>
      <ProductGrid sourceId={sourceId} />
    </div>
  );
};