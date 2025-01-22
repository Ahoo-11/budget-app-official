import { BillProduct, PaymentMethod } from "@/types/bills";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { calculateSubtotal, calculateGST, calculateTotal } from "@/lib/calculations";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PayerSelector } from "./PayerSelector";

interface OrderCartProps {
  sourceId: string;
  selectedProducts: BillProduct[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveProduct: (id: string) => void;
  onSuccess?: () => void;
}

export const OrderCart = ({
  sourceId,
  selectedProducts,
  onUpdateQuantity,
  onRemoveProduct,
  onSuccess
}: OrderCartProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);
  
  const { data: activeSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const { handleSubmit, handleCancel } = useBillUpdates({
    sourceId,
    onSuccess,
  });

  const handleCheckout = async () => {
    await handleSubmit(selectedProducts, selectedPayerId, paymentMethod);
  };

  const renderItemName = (item: BillProduct) => {
    let name = item.name;
    if (item.measurement_unit) {
      name += ` (${item.quantity} ${item.measurement_unit.symbol})`;
    } else {
      name += ` x${item.quantity}`;
    }
    return name;
  };

  const renderItemType = (item: BillProduct) => {
    switch (item.type) {
      case "product":
        return "Product";
      case "service":
        return "Service";
      case "consignment":
        return "Consignment";
      default:
        return item.type;
    }
  };

  if (!activeSession) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to create a bill
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PayerSelector
        selectedPayerId={selectedPayerId}
        onPayerSelect={setSelectedPayerId}
      />

      <PaymentMethodSelector
        method={paymentMethod}
        onChange={setPaymentMethod}
      />

      <div className="flex flex-col gap-2">
        {selectedProducts.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
              <span className="font-medium">{renderItemName(item)}</span>
              <span className="text-sm text-muted-foreground">
                {renderItemType(item)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRemoveProduct(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>{formatCurrency(calculateSubtotal(selectedProducts))}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>GST (10%)</span>
          <span>{formatCurrency(calculateGST(selectedProducts))}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(calculateTotal(selectedProducts))}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleCheckout}
            disabled={selectedProducts.length === 0}
          >
            Checkout
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};