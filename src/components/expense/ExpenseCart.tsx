import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
      // Create stock movements for each product
      const stockMovements = products.map(product => ({
        product_id: product.id,
        movement_type: 'purchase',
        quantity: product.quantity,
        unit_cost: product.purchase_price,
        created_by: (await supabase.auth.getUser()).data.user?.id,
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
          description: `Purchase from ${suppliers.find(s => s.id === supplierId)?.name}`,
          date: date.toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: "Purchase recorded successfully",
      });

      // Reset the cart
      products.forEach(product => onRemove(product.id));
      setSupplierId("");

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

      <div className="space-y-4">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Supplier</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="divide-y">
        {products.map((product) => (
          <div key={product.id} className="py-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current Stock: {product.current_stock} {product.unit_of_measurement}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.purchase_price}
                  onChange={(e) => onUpdatePrice(product.id, parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="text-right text-sm">
              Subtotal: ${(product.quantity * product.purchase_price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording Purchase...
              </>
            ) : (
              "Record Purchase"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};