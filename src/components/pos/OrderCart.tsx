import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderCartProps {
  products: (Product & { quantity: number })[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  sourceId: string;
  type: "income" | "expense";
}

export const OrderCart = ({ 
  products, 
  onRemove, 
  onUpdateQuantity,
  sourceId,
  type
}: OrderCartProps) => {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = useState("");

  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Must be logged in");
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          source_id: sourceId,
          description: `${type === 'income' ? 'Sale' : 'Purchase'} - ${customerName || 'Walk-in Customer'}`,
          amount: total,
          type: type,
          category: 'Sales',
          created_by_name: profile?.display_name || 'Unknown User'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      products.forEach(product => onRemove(product.id));
      setCustomerName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create transaction: " + error.message,
        variant: "destructive"
      });
    }
  });

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No items in cart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Cart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        <Input
          placeholder="Customer Name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mb-2"
        />
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-muted/5"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{product.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRemove(product.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3 p-3">
        <div className="flex justify-between w-full text-lg font-semibold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button 
          className="w-full" 
          onClick={() => createTransaction.mutate()}
          disabled={createTransaction.isPending}
        >
          Complete Sale
        </Button>
      </CardFooter>
    </Card>
  );
};