import { useParams } from "react-router-dom";
import { ProductGrid } from "@/components/products/ProductGrid";

interface ProductsIncomeProps {
  sourceId: string;
}

export const ProductsIncome = ({ sourceId }: ProductsIncomeProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products Income</h2>
      <ProductGrid sourceId={sourceId} />
    </div>
  );
};