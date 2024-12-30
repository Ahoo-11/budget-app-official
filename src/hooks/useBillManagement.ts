import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bill, BillItemJson, BillProduct } from "@/types/bill";
import { Product } from "@/types/product";
import { useSession } from "@supabase/auth-helpers-react";

export const useBillManagement = (sourceId: string) => {
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const { data: bills = [], refetch: refetchBills } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'on-hold'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Bill[];
    }
  });

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
      await refetchBills();
    } catch (error) {
      console.error('Error creating bill:', error);
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
      
      const billItems = Array.isArray(data.items) 
        ? (data.items as BillItemJson[]).map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            source_id: item.source_id,
            category: item.category,
            image_url: item.image_url,
            description: item.description,
            current_stock: 0,
            purchase_cost: null,
          }))
        : [];

      setActiveBillId(billId);
      setSelectedProducts(billItems);
    } catch (error) {
      console.error('Error switching bill:', error);
      toast({
        title: "Error",
        description: "Failed to switch bill",
        variant: "destructive",
      });
    }
  };

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
      const billProduct: BillProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        source_id: product.source_id,
        category: product.category || null,
        image_url: product.image_url || null,
        description: product.description || null,
        current_stock: product.current_stock || 0,
        purchase_cost: product.purchase_cost || null,
      };
      return [...prev, billProduct];
    });
  };

  const handleUpdateBillStatus = async (billId: string, status: 'active' | 'on-hold' | 'completed') => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', billId);

      if (error) throw error;
      await refetchBills();
      
      if (status === 'completed') {
        setActiveBillId(null);
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    }
  };

  return {
    bills,
    activeBillId,
    selectedProducts,
    isSubmitting,
    setSelectedProducts,
    handleNewBill,
    handleSwitchBill,
    handleProductSelect,
    handleUpdateBillStatus,
    refetchBills
  };
};