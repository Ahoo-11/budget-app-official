import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { ConsignmentGrid } from "./ConsignmentGrid";
import { useEffect, useState } from "react";

interface OrderContentProps {
  sourceId: string;
  onProductSelect: (product: BillProduct) => void;
}

interface SourceData {
  id: string;
  name: string;
  has_products: boolean;
  has_services: boolean;
  has_consignments: boolean;
}

export const OrderContent = ({ sourceId, onProductSelect }: OrderContentProps) => {
  const [selectedTab, setSelectedTab] = useState<string>("products");
  const [enabledTypes, setEnabledTypes] = useState<string[]>([]);

  const { data: sourceData } = useQuery<SourceData>({
    queryKey: ["source", sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("id, name")
        .eq("id", sourceId)
        .single();

      if (error) throw error;
      
      // Default all capabilities to true if they don't exist
      return {
        ...data,
        has_products: true,
        has_services: true,
        has_consignments: true
      };
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", sourceId],
    enabled: !!sourceId && enabledTypes.includes("products"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          measurement_unit:measurement_unit_id (
            id,
            name,
            symbol
          )
        `)
        .eq("source_id", sourceId);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (sourceData) {
      const types: string[] = [];
      if (sourceData.has_products) types.push("products");
      if (sourceData.has_services) types.push("services");
      if (sourceData.has_consignments) types.push("consignments");
      setEnabledTypes(types);
      
      // Set initial tab to first enabled type
      if (types.length > 0 && !types.includes(selectedTab)) {
        setSelectedTab(types[0]);
      }
    }
  }, [sourceData, selectedTab]);

  if (!sourceData || enabledTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No items available</p>
      </div>
    );
  }

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
      <TabsList>
        {enabledTypes.includes("products") && (
          <TabsTrigger value="products">Products</TabsTrigger>
        )}
        {enabledTypes.includes("services") && (
          <TabsTrigger value="services">Services</TabsTrigger>
        )}
        {enabledTypes.includes("consignments") && (
          <TabsTrigger value="consignments">Consignments</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="products" className="h-[calc(100%-40px)]">
        <ProductGrid sourceId={sourceId} products={products} onSelect={onProductSelect} />
      </TabsContent>

      <TabsContent value="services" className="h-[calc(100%-40px)]">
        <ServiceGrid sourceId={sourceId} onSelect={onProductSelect} />
      </TabsContent>

      <TabsContent value="consignments" className="h-[calc(100%-40px)]">
        <ConsignmentGrid sourceId={sourceId} onSelect={onProductSelect} />
      </TabsContent>
    </Tabs>
  );
};