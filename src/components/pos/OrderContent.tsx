import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTypes } from "@/hooks/useTypes";
import { useEffect, useState } from "react";

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
  const { types, isTypeEnabled } = useTypes(sourceId);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  // Get all enabled types
  const enabledTypes = types.filter(type => isTypeEnabled(type.id));

  // Set initial tab when enabled types are loaded
  useEffect(() => {
    if (enabledTypes.length > 0 && !selectedTab) {
      setSelectedTab(enabledTypes[0].id);
    }
  }, [enabledTypes, selectedTab]);

  if (enabledTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No enabled types found. Please enable types in settings.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Tabs 
          value={selectedTab || undefined} 
          onValueChange={setSelectedTab}
          className="h-full"
        >
          <TabsList className="w-full justify-start">
            {enabledTypes.map(type => (
              <TabsTrigger key={type.id} value={type.id}>
                {type.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {enabledTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="h-full">
              {type.id === 'products' && (
                <ProductGrid sourceId={sourceId} products={products} onSelect={onProductSelect} />
              )}
              {type.id === 'services' && (
                <ServiceGrid sourceId={sourceId} services={services} onSelect={onServiceSelect} />
              )}
              {/* Add other type components here as needed */}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};