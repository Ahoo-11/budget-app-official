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
}

export const OrderCart = ({ 
  products, 
  onRemove, 
  onUpdateQuantity,
  sourceId 
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
          description: `POS Sale - ${customerName || 'Walk-in Customer'}`,
          amount: total,
          type: 'income',
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
      // Clear the cart
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
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No items in cart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Customer Name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{product.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemove(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex justify-between w-full text-lg font-semibold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => createTransaction.mutate()}
          disabled={createTransaction.isPending}
        >
          Complete Sale
        </Button>
      </CardFooter>
    </Card>
  );
};