import { Bill, BillProduct } from '@/types/bills';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem extends BillProduct {
  quantity: number;
}

export function useCartManager(sourceId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addToCart = useCallback((product: Omit<BillProduct, 'quantity'>) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const createBill = useCallback(async () => {
    if (!sourceId) {
      toast({
        title: "Error",
        description: "Source ID is required",
        variant: "destructive",
      });
      return null;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const total = calculateTotal();
      const billData = {
        source_id: sourceId,
        user_id: user.id,
        items: cartItems,
        total,
        status: 'active' as const,
        date: new Date().toISOString(),
      };

      const { data: bill, error } = await supabase
        .from('bills')
        .insert([billData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      clearCart();
      return bill as Bill;
    } catch (error: any) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [sourceId, cartItems, toast, calculateTotal, clearCart]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotal,
    createBill,
    isSubmitting,
  };
}