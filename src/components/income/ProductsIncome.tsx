import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductForm } from "@/components/products/form/ProductForm";

interface ProductsIncomeProps {
  sourceId: string;
}

export const ProductsIncome = ({ sourceId }: ProductsIncomeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ProductForm sourceId={sourceId} onSuccess={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <ProductGrid sourceId={sourceId} />
    </div>
  );
}