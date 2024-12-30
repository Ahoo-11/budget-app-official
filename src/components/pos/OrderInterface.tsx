import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { useToast } from "@/hooks/use-toast";
import { BillActions } from "./BillActions";
import { useSession } from "@supabase/auth-helpers-react";
import { BillItem } from "@/types/bill";
import { fetchActiveBills, createNewBill, updateBillItems } from "./BillManager";
import { OnHoldBills } from "./OnHoldBills";
import { OrderContent } from "./OrderContent";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['sale-products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .gt('price', 0)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const { data: activeBills = [], refetch: refetchBills } = useQuery({
    queryKey: ['active-bills', sourceId],
    queryFn: () => fetchActiveBills(sourceId)
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
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleNewBill = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to create a bill",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // If there's an active bill with items, put it on hold
      if (activeBillId && selectedProducts.length > 0) {
        const { error } = await supabase
          .from('bills')
          .update({ status: 'on-hold', items: selectedProducts })
          .eq('id', activeBillId);
        
        if (error) throw error;
      }

      const data = await createNewBill(sourceId, session.user.id);
      setActiveBillId(data.id);
      setSelectedProducts([]);
      await refetchBills();
      
      toast({
        title: "New bill created",
        description: "You can now add items to this bill",
      });
    } catch (error) {
      console.error('Error creating new bill:', error);
      toast({
        variant: "destructive",
        title: "Error creating bill",
        description: "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchBill = async (billId: string) => {
    try {
      // Put current bill on hold if it has items
      if (activeBillId && selectedProducts.length > 0) {
        const { error } = await supabase
          .from('bills')
          .update({ status: 'on-hold', items: selectedProducts })
          .eq('id', activeBillId);
        
        if (error) throw error;
      }

      const { data, error } = await supabase
        .from('bills')
        .select('items')
        .eq('id', billId)
        .single();

      if (error) throw error;

      setActiveBillId(billId);
      setSelectedProducts(data.items.map((item: any) => ({
        ...item,
        quantity: item.quantity || 0,
        purchase_cost: null,
        minimum_stock_level: 0,
        current_stock: 0,
        supplier_id: null,
        storage_location: null,
        unit_of_measurement: null,
        subcategory: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })));
    } catch (error) {
      console.error('Error switching bill:', error);
      toast({
        variant: "destructive",
        title: "Error switching bill",
        description: "Please try again",
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-7 flex flex-col h-full">
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
        <OrderContent
          products={products}
          sourceId={sourceId}
          onProductSelect={handleProductSelect}
        />
      </div>

      <div className="col-span-5 h-full">
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
            if (!activeBillId) {
              toast({
                variant: "destructive",
                title: "No active bill",
                description: "Please create a new bill first",
              });
              return;
            }

            try {
              setIsSubmitting(true);
              await updateBillItems(activeBillId, selectedProducts);
              setSelectedProducts([]);
              setActiveBillId(null);
              await refetchBills();

              toast({
                title: "Bill completed",
                description: "The bill has been processed successfully",
              });
            } catch (error) {
              console.error('Error completing bill:', error);
              toast({
                variant: "destructive",
                title: "Error completing bill",
                description: "Please try again",
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};