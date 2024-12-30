import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { BillItem } from "@/types/bill";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "../expense/ItemSearch";
import { ProductGrid } from "./ProductGrid";
import { BillActions } from "./BillActions";
import { OnHoldBills } from "./OnHoldBills";
import { useToast } from "@/hooks/use-toast";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const { data: activeBills = [] } = useQuery({
    queryKey: ['active-bills', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'on-hold'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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

  const handleNewBill = async () => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          status: 'active',
          items: [],
          subtotal: 0,
          total: 0,
          gst: 0,
          discount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveBillId(data.id);
      setSelectedProducts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new bill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchBill = async (billId: string) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (error) throw error;
      setActiveBillId(billId);
      setSelectedProducts(data.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch bill",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <OnHoldBills
          bills={activeBills}
          onSwitchBill={handleSwitchBill}
          activeBillId={activeBillId}
        />
        <BillActions
          onNewBill={handleNewBill}
          onSwitchBill={handleSwitchBill}
          activeBills={activeBills}
          activeBillId={activeBillId}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <div className="space-y-4">
            <ItemSearch
              products={products}
              onSelect={handleProductSelect}
              sourceId={sourceId}
            />
            <ProductGrid products={products} onSelect={handleProductSelect} />
          </div>
        </div>

        <div className="col-span-5">
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
            onCheckout={async () => {
              // Implement checkout logic
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};