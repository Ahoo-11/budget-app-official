import { useState, useCallback } from 'react';
import { BillProduct } from '@/types/bill';

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