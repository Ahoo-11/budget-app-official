import { useState, useCallback } from "react";
import { ProductGrid } from "./ProductGrid";
import { OrderCart } from "./OrderCart";
import { ServiceGrid } from "./ServiceGrid";
import { BillProduct } from "@/types/bill";
import { useCheckoutManager } from "./checkout/CheckoutManager";
import { useBillManagement } from "@/hooks/useBillManagement";
import { BillActions } from "./BillActions";

export const OrderInterface = ({ sourceId }: { sourceId: string }) => {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
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

  const onCheckout = useCallback(
    async (payerId: string | null) => {
      if (!activeBillId) return;
      
      console.log('Starting checkout with payerId:', payerId);
      const success = await handleCheckout(activeBillId, selectedProducts, payerId);
      
      if (success) {
        refetchBills();
        handleNewBill();
      }
    },
    [activeBillId, selectedProducts, handleCheckout, refetchBills, handleNewBill]
  );

  const handleProductUpdate = useCallback((product: BillProduct) => {
    handleProductSelect(product);
  }, [handleProductSelect]);

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
              onClick={() => setActiveTab("products")}
            >
              Products
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "services"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onClick={() => setActiveTab("services")}
            >
              Services
            </button>
          </div>
          <BillActions
            bills={bills}
            activeBillId={activeBillId}
            onNewBill={handleNewBill}
            onSwitchBill={handleSwitchBill}
            onUpdateStatus={handleUpdateBillStatus}
            isSubmitting={isSubmitting}
          />
        </div>

        {activeTab === "products" ? (
          <ProductGrid
            sourceId={sourceId}
            onProductSelect={handleProductUpdate}
          />
        ) : (
          <ServiceGrid
            sourceId={sourceId}
            onServiceSelect={handleProductUpdate}
          />
        )}
      </div>

      <OrderCart
        items={selectedProducts}
        onUpdateItem={handleProductSelect}
        onCheckout={onCheckout}
        sourceId={sourceId}
      />
    </div>
  );
};