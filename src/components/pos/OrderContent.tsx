import { Product } from "@/types/product";
import { ItemSearch } from "../expense/ItemSearch";
import { ProductGrid } from "./ProductGrid";

interface OrderContentProps {
  products: Product[];
  sourceId: string;
  onProductSelect: (product: Product) => void;
}

export const OrderContent = ({ products, sourceId, onProductSelect }: OrderContentProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <ItemSearch
          products={products}
          onSelect={onProductSelect}
          sourceId={sourceId}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <ProductGrid products={products} onSelect={onProductSelect} />
      </div>
    </div>
  );
};