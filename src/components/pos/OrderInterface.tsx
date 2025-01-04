import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OrderInterface({ sourceId }: { sourceId: string }) {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  const { types, isTypeEnabled } = useTypes(sourceId);

  const { data: products = [] } = useQuery({
    queryKey: ["products", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "products" | "services")}>
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <ProductGrid products={products} />
          </TabsContent>
          <TabsContent value="services" className="mt-4">
            <ServiceGrid services={services} />
          </TabsContent>
        </Tabs>
      </div>
      <OrderCart sourceId={sourceId} />
    </div>
  );
}