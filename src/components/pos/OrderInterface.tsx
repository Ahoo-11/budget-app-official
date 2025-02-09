import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { OrderContent } from "./OrderContent";
import { OrderCart } from "./OrderCart";
import { BillProduct } from "@/types/bills";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  productType: string;
  unitPrice: number;
  currentStock: number;
  source_id: string;
}

export const OrderInterface = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products", sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_products")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");

      if (!data) {
        return [];
      }

      if (error) throw error;
      return data.map(product => ({
        id: product.id,
        name: product.name,
        productType: product.product_type,
        unitPrice: product.unit_price,
        currentStock: product.current_stock,
        source_id: product.source_id,
      }));
    },
  });

  if (!sourceId) {
    return null;
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const existingProduct = prev.find(p => p.id === product.id);
      
      if (existingProduct) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      const billProduct: BillProduct = {
        id: product.id,
        type: "product",
        name: product.name,
        price: product.unitPrice,
        quantity: 1,
        source_id: product.source_id,
        current_stock: product.currentStock,
        purchase_cost: null,
        category: undefined,
        description: undefined,
        measurement_unit: undefined,
      };

      return [...prev, billProduct];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, quantity } : p))
    );
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSuccess = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="flex h-full gap-4 p-4">
      <Card className="flex-1 p-4">
        <OrderContent
          sourceId={sourceId}
          onProductSelect={handleProductSelect}
        />
      </Card>
      <Card className="w-[400px] p-4">
        <OrderCart
          sourceId={sourceId}
          selectedProducts={selectedProducts}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveProduct={handleRemoveProduct}
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
};