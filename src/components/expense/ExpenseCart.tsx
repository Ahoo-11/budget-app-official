import { useState } from "react";
import { Product } from "@/types/product";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CartHeader } from "./CartHeader";
import { CartFooter } from "./CartFooter";

interface ExpenseCartProps {
  products: (Product & { quantity: number; purchase_price: number })[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
}

export const ExpenseCart = ({
  products,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  sourceId,
}: ExpenseCartProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [supplierId, setSupplierId] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const total = products.reduce(
    (sum, product) => sum + product.quantity * product.purchase_price,
    0
  );

  const handleSubmit = async () => {
    if (!supplierId) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (!products.length) {
      toast({
        title: "Error",
        description: "Please add some products",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create stock movements for each product
      const stockMovements = products.map(product => ({
        product_id: product.id,
        movement_type: 'purchase',
        quantity: product.quantity,
        unit_cost: product.purchase_price,
        created_by: user.id,
        notes: `Invoice: ${invoiceNo}`,
      }));

      const { error: stockError } = await supabase
        .from('stock_movements')
        .insert(stockMovements);

      if (stockError) throw stockError;

      // Update product stock levels and purchase costs
      for (const product of products) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            current_stock: (product.current_stock || 0) + product.quantity,
            purchase_cost: product.purchase_price,
          })
          .eq('id', product.id);

        if (updateError) throw updateError;
      }

      // Create expense transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          source_id: sourceId,
          type: 'expense',
          amount: total,
          description: `Purchase from ${suppliers.find(s => s.id === supplierId)?.name}${invoiceNo ? ` (Invoice: ${invoiceNo})` : ''}`,
          date: date.toISOString(),
          user_id: user.id,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: "Purchase recorded successfully",
      });

      // Reset the cart
      products.forEach(product => onRemove(product.id));
      setSupplierId("");
      setInvoiceNo("");

      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });

    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast({
        title: "Error",
        description: "Failed to record purchase",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium">Purchase Details</h3>

      <CartHeader
        date={date}
        setDate={setDate}
        supplierId={supplierId}
        setSupplierId={setSupplierId}
        invoiceNo={invoiceNo}
        setInvoiceNo={setInvoiceNo}
        suppliers={suppliers}
      />

      {products.length > 0 && (
        <CartFooter
          total={total}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};