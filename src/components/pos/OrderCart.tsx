import { BillProduct } from "@/types/bills";
import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartFooter } from "./cart/CartFooter";
import { PaymentInput } from "./cart/PaymentInput";
import { useCartManager } from "./cart/CartManager";
import { useCartCalculations } from "@/hooks/cart/useCartCalculations";
import { useCartPayment } from "@/hooks/cart/useCartPayment";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";

interface OrderCartProps {
  selectedProducts: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const OrderCart = ({
  selectedProducts,
  onUpdateQuantity,
  onRemove,
  sourceId,
  setSelectedProducts,
}: OrderCartProps) => {
  const {
    isSubmitting,
    paidAmount,
    setPaidAmount,
  } = useCartPayment();

  const {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal
  } = useCartCalculations(selectedProducts);

  const {
    date,
    selectedPayerId,
    handlePayerSelect,
    handleDateChange,
  } = useBillUpdates();

  const {
    handleCheckout,
    handleCancelBill,
  } = useCartManager({
    sourceId,
    selectedProducts,
    setSelectedProducts
  });

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
        selectedProducts={selectedProducts}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />

      {selectedProducts.length > 0 && (
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
            onDiscountChange={setDiscount}
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