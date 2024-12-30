import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { BillActions } from "./BillActions";
import { OnHoldBills } from "./OnHoldBills";
import { useCheckoutManager } from "./checkout/CheckoutManager";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number })[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const { handleCheckout } = useCheckoutManager();

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
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleNewBill = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a bill",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: session.user.id,
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
      const billItems = data.items || [];
      setSelectedProducts(billItems);
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
          bills={[]} // Pass the actual bills data here
          onSwitchBill={handleSwitchBill}
          activeBillId={activeBillId}
        />
        <BillActions
          onNewBill={handleNewBill}
          onSwitchBill={handleSwitchBill}
          activeBills={[]} // Pass the actual bills data here
          activeBillId={activeBillId}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <OrderContent
            products={products}
            sourceId={sourceId}
            onProductSelect={handleProductSelect}
          />
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
            onCheckout={async (customerId?: string) => {
              if (!activeBillId) {
                toast({
                  title: "Error",
                  description: "No active bill",
                  variant: "destructive",
                });
                return;
              }

              setIsSubmitting(true);
              const success = await handleCheckout(activeBillId, selectedProducts, customerId || null);
              if (success) {
                setSelectedProducts([]);
                setActiveBillId(null);
              }
              setIsSubmitting(false);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};