import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Bill, BillItem, BillItemJson } from "@/types/bill";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { BillActions } from "./BillActions";
import { OnHoldBills } from "./OnHoldBills";
import { useToast } from "@/hooks/use-toast";
import { deserializeBillItems, serializeBillItems } from "./BillManager";
import { useSession } from "@supabase/auth-helpers-react";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<BillItem[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

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
      return (data || []).map(bill => ({
        ...bill,
        items: Array.isArray(bill.items) ? bill.items : []
      })) as Bill[];
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
      
      queryClient.invalidateQueries({ queryKey: ['active-bills', sourceId] });
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
      const billItems = deserializeBillItems(Array.isArray(data.items) ? data.items as BillItemJson[] : []);
      setSelectedProducts(billItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch bill",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (!activeBillId || selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "No active bill or products selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate totals
      const subtotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstRate = 0.08; // 8% GST
      const gstAmount = subtotal * gstRate;
      const total = subtotal + gstAmount;

      // Update bill status and totals
      const { error: billError } = await supabase
        .from('bills')
        .update({
          status: 'completed',
          items: serializeBillItems(selectedProducts),
          subtotal,
          gst: gstAmount,
          total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeBillId);

      if (billError) throw billError;

      // Update product stock levels
      for (const item of selectedProducts) {
        const newStock = (item.current_stock || 0) - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ current_stock: newStock })
          .eq('id', item.id);

        if (stockError) throw stockError;

        // Create stock movement record
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: item.id,
            movement_type: 'sale',
            quantity: -item.quantity, // Negative for sales
            created_by: session?.user?.id,
            notes: `Sale from bill ${activeBillId}`,
          });

        if (movementError) throw movementError;
      }

      // Reset the current bill
      setActiveBillId(null);
      setSelectedProducts([]);

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['active-bills', sourceId] });
      queryClient.invalidateQueries({ queryKey: ['products', sourceId] });

      toast({
        title: "Success",
        description: "Bill completed successfully",
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to complete checkout",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            onCheckout={handleCheckout}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};