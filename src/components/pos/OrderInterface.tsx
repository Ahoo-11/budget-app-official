import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { OrderCart } from "./OrderCart";
import { ItemSearch } from "../expense/ItemSearch";
import { CustomerSelector } from "./CustomerSelector";
import { FilePlus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<(Product & { quantity: number })[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Implement checkout logic here
      console.log('Processing checkout:', { selectedProducts, selectedCustomer });
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBill = () => {
    // This will be implemented in the next phase
    console.log('Creating new bill...');
  };

  const handleViewRecent = () => {
    // This will be implemented in the next phase
    console.log('Viewing recent transactions...');
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleViewRecent}
                  className="h-9 w-9"
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recent Transactions</p>
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
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};