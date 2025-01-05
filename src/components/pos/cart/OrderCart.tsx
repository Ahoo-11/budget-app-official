import { BillProduct } from "@/types/bill";
import { CartHeader } from "./CartHeader";
import { CartItems } from "./CartItems";
import { CartFooter } from "./CartFooter";
import { PaymentInput } from "./PaymentInput";
import { useCartManager } from "./CartManager";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";

interface OrderCartProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const OrderCart = ({
  items = [],
  onUpdateQuantity,
  onRemove,
  sourceId,
  setSelectedProducts,
}: OrderCartProps) => {
  const {
    isSubmitting,
    paidAmount,
    setPaidAmount,
    handleCheckout,
    handleCancelBill,
  } = useCartManager(sourceId, items, setSelectedProducts);

  const {
    discount,
    date,
    selectedPayerId,
    subtotal,
    gstAmount,
    finalTotal,
    handlePayerSelect,
    handleDateChange,
    handleDiscountChange
  } = useBillUpdates(undefined, items);

  return (
    <div className="bg-white h-full flex flex-col border rounded-lg">
      <CartHeader
        selectedPayerId={selectedPayerId}
        date={date}
        onPayerSelect={handlePayerSelect}
        onDateChange={handleDateChange}
      />

      <div className="border-t p-4">
        <h3 className="font-medium text-lg">Order Summary</h3>
      </div>

      <CartItems
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />

      {items.length > 0 && (
        <>
          <div className="border-t p-4">
            <PaymentInput
              total={finalTotal}
              paidAmount={paidAmount}
              onPaidAmountChange={setPaidAmount}
            />
          </div>
          <CartFooter
            subtotal={subtotal}
            gstAmount={gstAmount}
            discount={discount}
            finalTotal={finalTotal}
            onDiscountChange={handleDiscountChange}
            onCheckout={handleCheckout}
            onCancelBill={handleCancelBill}
            selectedPayerId={selectedPayerId}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </div>
  );
};