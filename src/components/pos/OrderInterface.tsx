import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { BillItem } from "@/types/bill";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "./ItemSearch";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';
import "handsontable/dist/handsontable.full.min.css";

// Register all Handsontable modules
registerAllModules();

interface ExpenseInterfaceProps {
  sourceId: string;
}

export const ExpenseInterface = ({ sourceId }: ExpenseInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1,
        purchase_price: product.purchase_cost || 0
      }];
    });
  };

  const spreadsheetData = selectedProducts.map(product => [
    product.name,
    product.purchase_price,
    product.quantity,
    (product.purchase_price * product.quantity).toFixed(2)
  ]);

  const handleSpreadsheetChange = (changes: any[]) => {
    if (!changes) return;

    changes.forEach(([row, prop, , newValue]) => {
      const product = selectedProducts[row];
      if (!product) return;

      setSelectedProducts(prev => prev.map((p, index) => {
        if (index !== row) return p;

        switch(prop) {
          case 1: // Price column
            return { ...p, purchase_price: parseFloat(newValue) || 0 };
          case 2: // Quantity column
            return { ...p, quantity: parseFloat(newValue) || 0 };
          default:
            return p;
        }
      }));
    });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-7">
        <ItemSearch
          products={products}
          onSelect={handleProductSelect}
          sourceId={sourceId}
        />

        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <div className="bg-accent/50 p-4 rounded-lg mb-4">
              <HotTable
                data={spreadsheetData}
                colHeaders={['Item', 'Price', 'Quantity', 'Total']}
                columns={[
                  { data: 0, type: 'text', readOnly: true },
                  { data: 1, type: 'numeric', numericFormat: { pattern: '0.00' } },
                  { data: 2, type: 'numeric', numericFormat: { pattern: '0' } },
                  { data: 3, type: 'numeric', readOnly: true, numericFormat: { pattern: '0.00' } },
                ]}
                stretchH="all"
                height={Math.min(400, 100 + selectedProducts.length * 30)}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleSpreadsheetChange}
                className="font-sans"
              />
            </div>
          </div>
        )}
      </div>

      <div className="col-span-5">
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <OrderCart
            products={selectedProducts}
            onUpdateQuantity={(productId, quantity) => {
              setSelectedProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, quantity } : p)
              );
            }}
            onUpdatePrice={(productId, price) => {
              setSelectedProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, purchase_price: price } : p)
              );
            }}
            onRemove={(productId) => {
              setSelectedProducts(prev => prev.filter(p => p.id !== productId));
            }}
            sourceId={sourceId}
          />
        </div>
      </div>
    </div>
  );
};