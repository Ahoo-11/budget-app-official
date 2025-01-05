import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bill, BillProduct } from '@/types/bills';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutManagerProps {
  bill: Bill;
  onCheckoutSuccess: () => void;
}

export const CheckoutManager = ({ bill, onCheckoutSuccess }: CheckoutManagerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Perform checkout logic here
      const { error } = await supabase
        .from('bills')
        .update({ status: 'paid' })
        .eq('id', bill.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill has been successfully checked out.",
      });
      onCheckoutSuccess();
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: "Failed to complete the checkout.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Checkout Bill #{bill.id.slice(0, 8)}</h2>
      <div>
        <label className="block text-sm font-medium mb-2">Total Amount</label>
        <Input
          type="text"
          value={`MVR ${bill.total?.toFixed(2)}`}
          readOnly
        />
      </div>
      <Button
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Processing..." : "Checkout"}
      </Button>
    </div>
  );
};
