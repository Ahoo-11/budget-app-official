import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "../expense/ItemSearch";
import { FilePlus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['sale-products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .gt('price', 0)
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as Product[];
    }
  });

  const { data: activeBills = [], refetch: refetchBills } = useQuery({
    queryKey: ['active-bills', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'on-hold'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }
      return data;
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
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleNewBill = async () => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          status: 'active',
          items: [],
        })
        .select()
        .single();

      if (error) throw error;

      setActiveBillId(data.id);
      setSelectedProducts([]);
      await refetchBills();
      
      toast({
        title: "New bill created",
        description: "You can now add items to this bill",
      });
    } catch (error) {
      console.error('Error creating new bill:', error);
      toast({
        variant: "destructive",
        title: "Error creating bill",
        description: "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchBill = async (billId: string) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('items')
        .eq('id', billId)
        .single();

      if (error) throw error;

      // Convert stored items back to product format with quantities
      const storedProducts = data.items.map((item: any) => ({
        ...item,
        quantity: item.quantity || 1,
      }));

      setActiveBillId(billId);
      setSelectedProducts(storedProducts);
    } catch (error) {
      console.error('Error switching bill:', error);
      toast({
        variant: "destructive",
        title: "Error switching bill",
        description: "Please try again",
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-7 flex flex-col h-full overflow-hidden">
        <div className="p-4 space-y-4">
          <ItemSearch
            products={products}
            onSelect={handleProductSelect}
            sourceId={sourceId}
          />
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
                onClick={() => handleProductSelect(product)}
              >
                <div className="aspect-square relative mb-2">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-sm text-muted-foreground">MVR {product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-5 h-full">
        <div className="flex justify-end gap-2 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewBill}
                  className="h-9 w-9"
                  disabled={isSubmitting}
                >
                  <FilePlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Bill</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Recent Bills</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      {activeBills.map((bill) => (
                        <div
                          key={bill.id}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            bill.id === activeBillId ? 'border-primary' : ''
                          }`}
                          onClick={() => handleSwitchBill(bill.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Bill #{bill.id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(bill.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                bill.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bill.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recent Bills</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

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
          onCheckout={async () => {
            if (!activeBillId) {
              toast({
                variant: "destructive",
                title: "No active bill",
                description: "Please create a new bill first",
              });
              return;
            }

            try {
              setIsSubmitting(true);
              const { error } = await supabase
                .from('bills')
                .update({
                  items: selectedProducts,
                  status: 'completed',
                })
                .eq('id', activeBillId);

              if (error) throw error;

              setSelectedProducts([]);
              setActiveBillId(null);
              await refetchBills();

              toast({
                title: "Bill completed",
                description: "The bill has been processed successfully",
              });
            } catch (error) {
              console.error('Error completing bill:', error);
              toast({
                variant: "destructive",
                title: "Error completing bill",
                description: "Please try again",
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};