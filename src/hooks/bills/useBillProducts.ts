import { useState, useCallback } from 'react';
import { BillProduct } from '@/types/bills';

export const useBillProducts = () => {
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);

  const handleProductSelect = useCallback((product: Omit<BillProduct, 'quantity'>) => {
    setSelectedProducts(prevProducts => {
      const existingProduct = prevProducts.find(p => p.id === product.id);
      
      if (existingProduct) {
        return prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prevProducts, { 
        ...product, 
        quantity: 1,
        current_stock: product.current_stock || 0,
        purchase_cost: product.purchase_cost || null,
        income_type_id: product.income_type_id || null
      }];
    });
  }, []);

  return {
    selectedProducts,
    setSelectedProducts,
    handleProductSelect
  };
};