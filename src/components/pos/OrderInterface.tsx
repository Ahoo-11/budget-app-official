import { useState } from "react";
import { Card } from "@/components/ui/card";
import { OrderContent } from "./OrderContent";
import { OrderCart } from "./OrderCart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { BillProduct } from "@/types/bills";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);

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

  const handleProductSelect = (product: Product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);

    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          type: "product",
          current_stock: product.current_stock || 0,
          purchase_cost: product.purchase_cost || null
        } as BillProduct,
      ]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    const existingService = selectedProducts.find((p) => p.id === service.id);

    if (existingService) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === service.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...service,
          quantity: 1,
          type: "service",
          current_stock: 0,
          purchase_cost: null
        } as BillProduct,
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="p-4">
        <OrderContent
          products={products}
          services={services}
          sourceId={sourceId}
          onProductSelect={handleProductSelect}
          onServiceSelect={handleServiceSelect}
        />
      </Card>

      <OrderCart
        selectedProducts={selectedProducts}
        onUpdateQuantity={(productId: string, quantity: number) => {
          setSelectedProducts(
            selectedProducts.map((p) =>
              p.id === productId ? { ...p, quantity } : p
            )
          );
        }}
        onRemove={(productId: string) => {
          setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
        }}
        sourceId={sourceId}
        setSelectedProducts={setSelectedProducts}
      />
    </div>
  );
};