import { useState } from "react";
import { Card } from "@/components/ui/card";
import { OrderContent } from "./OrderContent";
import { OrderCart } from "./OrderCart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { BillProduct } from "@/types/bills";
import { useTypes } from "@/hooks/useTypes";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);
  const { types, isTypeEnabled } = useTypes(sourceId);
  const enabledTypes = types.filter(type => isTypeEnabled(type.id));

  // Fetch data for all enabled types
  const { data: products = [] } = useQuery({
    queryKey: ["products", sourceId],
    queryFn: async () => {
      if (!enabledTypes.some(type => type.id === 'products')) return [];

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
        .eq("source_id", sourceId)
        .order("name");

      if (error) throw error;
      return data as Product[];
    },
    enabled: enabledTypes.some(type => type.id === 'products'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", sourceId],
    queryFn: async () => {
      if (!enabledTypes.some(type => type.id === 'services')) return [];

      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          measurement_unit:measurement_unit_id (
            id,
            name,
            symbol
          )
        `)
        .eq("source_id", sourceId)
        .order("name");

      if (error) throw error;
      return data as Service[];
    },
    enabled: enabledTypes.some(type => type.id === 'services'),
  });

  const handleProductSelect = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          type: "product",
          source_id: product.source_id,
          current_stock: product.current_stock,
          purchase_cost: product.purchase_cost,
          category: product.category,
          description: product.description,
          image_url: product.image_url,
          measurement_unit_id: product.measurement_unit_id,
          measurement_unit: product.measurement_unit
        },
      ]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    const existingService = selectedProducts.find(p => p.id === service.id);
    if (existingService) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === service.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: service.id,
          name: service.name,
          price: service.price,
          quantity: 1,
          type: "service",
          source_id: service.source_id,
          current_stock: 0,
          purchase_cost: null,
          category: service.category,
          description: service.description,
          image_url: service.image_url,
          measurement_unit_id: service.measurement_unit_id,
          measurement_unit: service.measurement_unit
        },
      ]);
    }
  };

  return (
    <div className="grid grid-cols-[1fr,400px] h-full gap-4">
      <Card className="p-4">
        <OrderContent
          products={products}
          services={services}
          sourceId={sourceId}
          onProductSelect={handleProductSelect}
          onServiceSelect={handleServiceSelect}
        />
      </Card>
      <Card>
        <OrderCart
          products={selectedProducts}
          onProductsChange={setSelectedProducts}
          sourceId={sourceId}
        />
      </Card>
    </div>
  );
};