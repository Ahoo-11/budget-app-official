import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderContentProps {
  products: Product[];
  services: Service[];
  sourceId: string;
  onProductSelect: (product: Product) => void;
  onServiceSelect: (service: Service) => void;
}

export const OrderContent = ({ 
  products, 
  services, 
  sourceId, 
  onProductSelect, 
  onServiceSelect 
}: OrderContentProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="products" className="h-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="h-full">
            <ProductGrid sourceId={sourceId} products={products} onSelect={onProductSelect} />
          </TabsContent>
          <TabsContent value="services" className="h-full">
            <ServiceGrid sourceId={sourceId} services={services} onSelect={onServiceSelect} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};