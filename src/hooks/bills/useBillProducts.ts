import { useState } from "react";
import { BillProduct } from "@/types/bill";

export const useBillProducts = () => {
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);

  const handleProductSelect = (item: { id: string; name: string; price: number; source_id: string; category?: string; image_url?: string; description?: string; current_stock?: number; purchase_cost?: number | null; }) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => 
          p.id === item.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      const billProduct: BillProduct = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        source_id: item.source_id,
        category: item.category || null,
        image_url: 'image_url' in item ? item.image_url : null,
        description: item.description || null,
        type: 'current_stock' in item ? 'product' : 'service',
        current_stock: 'current_stock' in item ? item.current_stock : undefined,
        purchase_cost: 'purchase_cost' in item ? item.purchase_cost : null,
      };
      return [...prev, billProduct];
    });
  };

  return {
    selectedProducts,
    setSelectedProducts,
    handleProductSelect
  };
};