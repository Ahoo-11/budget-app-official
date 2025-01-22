import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { BillProduct } from "@/types/bills";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { serializeBillItems } from "@/lib/bills";

interface CartFooterProps {
  subtotal: number;
  discount: number;
  setDiscount: (discount: number) => void;
  gstAmount: number;
  finalTotal: number;
  sourceId: string;
  products: BillProduct[];
  onProductsChange: (products: BillProduct[]) => void;
  paymentMethod: 'cash' | 'transfer';
  isBillSubmitting: boolean;
}

export const CartFooter = ({
  subtotal,
  discount,
  setDiscount,
  gstAmount,
  finalTotal,
  sourceId,
  products,
  onProductsChange,
  paymentMethod,
  isBillSubmitting
}: CartFooterProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBillMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .single();

      if (!session) throw new Error("No active session found");

      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: user.id,
          session_id: session.id,
          status: 'completed',
          items: serializeBillItems(products),
          subtotal,
          discount,
          gst: gstAmount,
          total: finalTotal,
          payment_method: paymentMethod,
          paid_amount: finalTotal,
        })
        .select()
        .single();

      if (billError) throw billError;

      // Update product stock levels
      for (const product of products) {
        if (product.type === 'product') {
          const { error: stockError } = await supabase
            .from('products')
            .update({
              current_stock: product.current_stock - product.quantity
            })
            .eq('id', product.id);

          if (stockError) throw stockError;
        }
      }

      return bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      onProductsChange([]);
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4 p-4 border-t">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>MVR {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span>GST (6%)</span>
          <span>MVR {gstAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-medium text-lg pt-2 border-t">
          <span>Total</span>
          <span>MVR {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => createBillMutation.mutate()}
        disabled={products.length === 0 || isBillSubmitting || createBillMutation.isPending}
      >
        {(isBillSubmitting || createBillMutation.isPending) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay MVR ${finalTotal.toFixed(2)}`
        )}
      </Button>
    </div>
  );
};