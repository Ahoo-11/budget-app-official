import { ProductGrid } from "@/components/products/ProductGrid";

interface ProductsIncomeProps {
  sourceId: string;
}

export const ProductsIncome = ({ sourceId }: ProductsIncomeProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Income</h2>
      </div>
      <ProductGrid sourceId={sourceId} />
    </div>
  );
}