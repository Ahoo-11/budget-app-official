import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { useBillProducts } from "@/hooks/bills/useBillProducts";
import { BillProduct } from "@/types/bill";
import { useBillManagement } from "@/hooks/useBillManagement";
import { BillActions } from "./BillActions";

interface OrderInterfaceProps {
  sourceId: string;
}

export function OrderInterface({ sourceId }: OrderInterfaceProps) {
  const { 
    selectedProducts, 
    setSelectedProducts, 
    handleProductSelect 
  } = useBillProducts();

  const {
    bills,
    activeBillId,
    isSubmitting,
    handleNewBill,
    handleSwitchBill,
  } = useBillManagement(sourceId);

  const { data: products = [] } = useQuery({
    queryKey: ["products", sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("source_id", sourceId)
        .neq("category", "inventory")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!sourceId
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!sourceId
  });

  const handleServiceSelect = (service: Service) => {
    const billProduct: Omit<BillProduct, "quantity"> = {
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
      source_id: sourceId,
      category: service.category,
      description: service.description,
      current_stock: 0,
      purchase_cost: 0,
    };
    handleProductSelect(billProduct);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-4 border-b">
        <BillActions
          onNewBill={handleNewBill}
          onSwitchBill={handleSwitchBill}
          activeBills={bills}
          activeBillId={activeBillId}
          isSubmitting={isSubmitting}
          setSelectedProducts={setSelectedProducts}
        />
      </div>
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <OrderContent
            products={products}
            services={services}
            sourceId={sourceId}
            onProductSelect={product => handleProductSelect({
              ...product,
              current_stock: product.current_stock || 0,
              purchase_cost: product.purchase_cost || 0,
            })}
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
    </div>
  );
}