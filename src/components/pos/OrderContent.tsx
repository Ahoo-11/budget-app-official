import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { ItemSearch } from "../expense/ItemSearch";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderContentProps {
  products: Product[];
  sourceId: string;
  onProductSelect: (product: Product) => void;
  onServiceSelect: (service: Service) => void;
}

export const OrderContent = ({ products, sourceId, onProductSelect, onServiceSelect }: OrderContentProps) => {
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
        <Tabs defaultValue="products" className="h-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="h-full">
            <ProductGrid products={products} onSelect={onProductSelect} />
          </TabsContent>
          <TabsContent value="services" className="h-full">
            <ServiceGrid sourceId={sourceId} onSelect={onServiceSelect} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};