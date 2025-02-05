import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CartHeader } from "./CartHeader";
import { CartFooter } from "./CartFooter";
import type { Database } from "@/types/database-types";

type Product = Database["budget_app"]["Tables"]["products"]["Row"];
type StockMovement = Database["budget_app"]["Tables"]["stock_movements"]["Row"];
type Supplier = Database["budget_app"]["Tables"]["suppliers"]["Row"];

interface CartProduct extends Product {
  quantity: number;
  purchase_price: number;
}

interface ExpenseCartProps {
  products: CartProduct[];
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

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useQuery({
    queryKey: ['suppliers', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, email, phone, address')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      return (data || []) as Supplier[];
    },
    enabled: !!sourceId
  });

  const total = products.reduce(
    (sum, product) => sum + product.quantity * product.purchase_price,
    0
  );

  const createExpense = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error("Please select a supplier");
      if (!products.length) throw new Error("Please add some products");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Start a Supabase transaction
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          source_id: sourceId,
          supplier_id: supplierId,
          invoice_no: invoiceNo,
          date: date.toISOString(),
          total_amount: total,
          created_by: user.id,
          status: 'completed'
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create stock movements for each product
      const stockMovements = products.map(product => ({
        product_id: product.id,
        expense_id: expense.id,
        movement_type: 'purchase',
        quantity: product.quantity,
        unit_cost: product.purchase_price,
        created_by: user.id,
        notes: `Invoice: ${invoiceNo}`,
        source_id: sourceId
      }));

      const { error: stockError } = await supabase
        .from('stock_movements')
        .insert(stockMovements);

      if (stockError) throw stockError;

      // Update product stock levels and costs
      for (const product of products) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            current_stock: (product.current_stock || 0) + product.quantity,
            last_purchase_price: product.purchase_price,
            last_purchase_date: date.toISOString()
          })
          .eq('id', product.id)
          .eq('source_id', sourceId);

        if (updateError) throw updateError;
      }

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });

      // Reset form
      setSupplierId("");
      setInvoiceNo("");
      setDate(new Date());
      products.forEach(product => onRemove(product.id));
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    createExpense.mutate();
  };

  return (
    <div className="flex flex-col h-full">
      <CartHeader
        date={date}
        setDate={setDate}
        supplierId={supplierId}
        setSupplierId={setSupplierId}
        suppliers={suppliers}
        invoiceNo={invoiceNo}
        setInvoiceNo={setInvoiceNo}
        isLoading={isSuppliersLoading}
      />

      <div className="flex-1 overflow-auto p-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2 border-b"
          >
            <div className="flex-1">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-500">
                Stock: {product.current_stock || 0}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) => onUpdateQuantity(product.id, +e.target.value)}
                className="w-20 p-1 border rounded"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={product.purchase_price}
                onChange={(e) => onUpdatePrice(product.id, +e.target.value)}
                className="w-24 p-1 border rounded"
              />
              <button
                onClick={() => onRemove(product.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <CartFooter
        total={total}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || createExpense.isPending}
        itemCount={products.length}
      />
    </div>
  );
};