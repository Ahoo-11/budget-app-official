import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { useBillProducts } from "@/hooks/bills/useBillProducts";

interface OrderInterfaceProps {
  sourceId: string;
}

export function OrderInterface({ sourceId }: OrderInterfaceProps) {
  const { selectedProducts, setSelectedProducts, handleProductSelect } = useBillProducts();

  const { data: products = [] } = useQuery({
    queryKey: ["products", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");
      
      if (error) throw error;
      return data as Product[];
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
      return data as Service[];
    },
  });

  const handleServiceSelect = (service: Service) => {
    handleProductSelect({
      ...service,
      type: 'service',
      source_id: sourceId,
    });
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1">
        <OrderContent
          products={products}
          services={services}
          sourceId={sourceId}
          onProductSelect={handleProductSelect}
          onServiceSelect={handleServiceSelect}
        />
      </div>
      <div className="w-[400px]">
        <OrderCart
          items={selectedProducts}
          onUpdateQuantity={(productId, quantity) => {
            setSelectedProducts(prev =>
              prev.map(p => p.id === productId ? { ...p, quantity } : p)
            );
          }}
          onRemove={(productId) => {
            setSelectedProducts(prev => prev.filter(p => p.id !== productId));
          }}
          sourceId={sourceId}
          setSelectedProducts={setSelectedProducts}
        />
      </div>
    </div>
  );
}