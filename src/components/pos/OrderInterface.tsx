import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { BillProduct } from "@/types/bill";
import { OrderCart } from "./OrderCart";
import { OrderContent } from "./OrderContent";
import { BillActions } from "./BillActions";
import { OnHoldBills } from "./OnHoldBills";
import { useCheckoutManager } from "./checkout/CheckoutManager";
import { useBillManagement } from "@/hooks/useBillManagement";

interface OrderInterfaceProps {
  sourceId: string;
}

export const OrderInterface = ({ sourceId }: OrderInterfaceProps) => {
  const { 
    bills,
    activeBillId,
    selectedProducts,
    isSubmitting,
    setSelectedProducts,
    handleNewBill,
    handleSwitchBill,
    handleProductSelect,
    handleUpdateBillStatus,
  } = useBillManagement(sourceId);

  const { handleCheckout } = useCheckoutManager();

  const { data: products = [] } = useQuery({
    queryKey: ['products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const handleServiceSelect = (service: Service) => {
    setSelectedProducts(prev => {
      const serviceProduct: BillProduct = {
        id: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        type: 'service'
      };
      
      const existing = prev.find(p => p.id === service.id && p.type === 'service');
      if (existing) {
        return prev.map(p => 
          p.id === service.id && p.type === 'service'
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, serviceProduct];
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <OnHoldBills
          bills={bills}
          onSwitchBill={handleSwitchBill}
          activeBillId={activeBillId}
        />
        <BillActions
          activeBills={bills}
          onNewBill={handleNewBill}
          onSwitchBill={handleSwitchBill}
          activeBillId={activeBillId}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <OrderContent
            products={products}
            sourceId={sourceId}
            onProductSelect={handleProductSelect}
            onServiceSelect={handleServiceSelect}
          />
        </div>

        <div className="col-span-5">
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
            onCheckout={async (customerId?: string) => {
              if (!activeBillId) return;
              
              const success = await handleCheckout(activeBillId, selectedProducts, customerId || null);
              if (success) {
                await handleUpdateBillStatus(activeBillId, 'completed');
              }
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};