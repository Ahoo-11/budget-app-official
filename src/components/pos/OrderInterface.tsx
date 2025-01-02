import { useState, useCallback, useEffect } from "react";
import { ProductGrid } from "./ProductGrid";
import { OrderCart } from "./OrderCart";
import { ServiceGrid } from "./ServiceGrid";
import { BillProduct } from "@/types/bill";
import { Product } from "@/types/product";
import { useCheckoutManager } from "./checkout/CheckoutManager";
import { useBillManagement } from "@/hooks/useBillManagement";
import { BillActions } from "./BillActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OrderInterface = ({ sourceId }: { sourceId: string }) => {
  const [activeTab, setActiveTab] = useState<"products" | "services" | "income">("products");
  const { handleCheckout } = useCheckoutManager();
  const {
    bills,
    activeBillId,
    selectedProducts,
    isSubmitting,
    handleNewBill,
    handleSwitchBill,
    handleProductSelect,
    handleUpdateBillStatus,
    refetchBills,
  } = useBillManagement(sourceId);

  console.log('🧾 Current bills:', bills);
  console.log('📄 Active bill ID:', activeBillId);
  console.log('🛍️ Selected products:', selectedProducts);

  // Fetch default "Walk-in Customer" payer using exact name match
  const { data: defaultPayer } = useQuery({
    queryKey: ['default-payer'],
    queryFn: async () => {
      console.log('🔍 Fetching default payer...');
      const { data, error } = await supabase
        .from('payers')
        .select('id')
        .eq('name', 'Walk-in Customer')
        .single();
      
      if (error) throw error;
      console.log('👤 Default payer:', data);
      return data;
    }
  });

  const onCheckout = useCallback(
    async (payerId: string | null) => {
      console.log('🚀 Checkout initiated with payerId:', payerId);
      if (!activeBillId) {
        console.error('❌ No active bill ID for checkout');
        return;
      }
      
      // Use default payer if none selected
      const finalPayerId = payerId || defaultPayer?.id || null;
      console.log('👤 Using payer ID for checkout:', finalPayerId);
      
      const success = await handleCheckout(activeBillId, selectedProducts, finalPayerId);
      console.log('✅ Checkout success:', success);
      
      if (success) {
        console.log('🔄 Refetching bills...');
        refetchBills();
        handleNewBill();
      }
    },
    [activeBillId, selectedProducts, handleCheckout, refetchBills, handleNewBill, defaultPayer]
  );

  const handleProductUpdate = useCallback((product: Product) => {
    const billProduct: BillProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      type: 'product',
      source_id: sourceId,
      category: product.category || null,
      image_url: product.image_url || null,
      description: product.description || null,
      current_stock: product.current_stock || 0,
      purchase_cost: product.purchase_cost || null
    };
    handleProductSelect(billProduct);
  }, [handleProductSelect, sourceId]);

  const handleServiceUpdate = useCallback((service: Product) => {
    const billProduct: BillProduct = {
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
      type: 'service',
      source_id: sourceId,
      category: service.category || null,
      image_url: service.image_url || null,
      description: service.description || null,
      current_stock: 0,
      purchase_cost: null
    };
    handleProductSelect(billProduct);
  }, [handleProductSelect, sourceId]);

  const handleTabChange = useCallback(async (tab: "products" | "services" | "income") => {
    if (tab === "income") {
      try {
        // If no active bill, create one
        if (!activeBillId) {
          console.log('Creating new bill for income tab...');
          const newBillId = await handleNewBill();
          if (!newBillId) {
            console.error('Failed to create new bill');
            return; // Don't switch tab if bill creation fails
          }
          console.log('New bill created, ID:', newBillId);
          
          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verify the bill was created
          if (!activeBillId) {
            console.error('Bill created but activeBillId not set');
            return;
          }
        } else {
          console.log('Using existing active bill:', activeBillId);
        }
      } catch (error) {
        console.error('Error handling income tab:', error);
        return;
      }
    }
    setActiveTab(tab);
  }, [activeBillId, handleNewBill]);

  // Ensure we have an active bill when in income tab
  useEffect(() => {
    const ensureActiveBill = async () => {
      if (activeTab === "income" && !activeBillId) {
        console.log('No active bill in income tab, creating one...');
        const newBillId = await handleNewBill();
        if (newBillId) {
          console.log('Created new bill in effect, ID:', newBillId);
        }
      }
    };

    ensureActiveBill();
  }, [activeTab, activeBillId, handleNewBill]);

  return (
    <div className="flex h-full">
      <div className="w-2/3 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "products"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => handleTabChange("products")}
            >
              Products
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "services"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => handleTabChange("services")}
            >
              Services
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "income"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => handleTabChange("income")}
            >
              Income
            </button>
          </div>
          <BillActions
            onNewBill={handleNewBill}
            onSwitchBill={handleSwitchBill}
            activeBills={bills || []}
            activeBillId={activeBillId}
            isSubmitting={isSubmitting}
          />
        </div>

        {activeTab === "products" ? (
          <ProductGrid
            sourceId={sourceId}
            onProductSelect={handleProductUpdate}
          />
        ) : activeTab === "services" ? (
          <ServiceGrid
            sourceId={sourceId}
            onSelect={handleServiceUpdate}
          />
        ) : (
          // Add income tab content here
          <div>Income tab content</div>
        )}
      </div>

      <OrderCart
        items={selectedProducts}
        onUpdateQuantity={(productId: string, quantity: number) => {
          const product = selectedProducts.find(p => p.id === productId);
          if (product) {
            const updatedProduct: BillProduct = {
              ...product,
              quantity,
              source_id: sourceId
            };
            handleProductSelect(updatedProduct);
          }
        }}
        onRemove={(productId: string) => {
          const product = selectedProducts.find(p => p.id === productId);
          if (product) {
            const updatedProduct: BillProduct = {
              ...product,
              quantity: 0,
              source_id: sourceId
            };
            handleProductSelect(updatedProduct);
          }
        }}
        onCheckout={onCheckout}
        isSubmitting={isSubmitting}
        activeBillId={activeBillId}
        defaultPayerId={defaultPayer?.id}
      />
    </div>
  );
};