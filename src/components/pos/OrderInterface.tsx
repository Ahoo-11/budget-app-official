import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "../expense/ItemSearch";
import { useToast } from "@/hooks/use-toast";
import { BillActions } from "./BillActions";
import { ProductGrid } from "./ProductGrid";
import { useSession } from "@supabase/auth-helpers-react";
import { Bill, BillItem } from "@/types/bill";

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
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as Product[];
    }
  });

  const { data: activeBills = [], refetch: refetchBills } = useQuery({
    queryKey: ['active-bills', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'on-hold'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }
      return data as Bill[];
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
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to create a bill",
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
      const { data, error } = await supabase
        .from('bills')
        .select('items')
        .eq('id', billId)
        .single();

      if (error) throw error;

      setActiveBillId(billId);
      setSelectedProducts(data.items as BillItem[]);
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
      <div className="col-span-7 flex flex-col h-full overflow-hidden">
        <div className="p-4 space-y-4">
          <ItemSearch
            products={products}
            onSelect={handleProductSelect}
            sourceId={sourceId}
          />
        </div>
        <div className="flex-1 overflow-auto p-4">
          <ProductGrid products={products} onSelect={handleProductSelect} />
        </div>
      </div>

      <div className="col-span-5 h-full">
        <BillActions
          onNewBill={handleNewBill}
          onSwitchBill={handleSwitchBill}
          activeBills={activeBills}
          activeBillId={activeBillId}
          isSubmitting={isSubmitting}
        />

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
              const { error } = await supabase
                .from('bills')
                .update({
                  items: selectedProducts,
                  status: 'completed',
                })
                .eq('id', activeBillId);

              if (error) throw error;

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