import { useState } from "react";
import { BillProduct } from "@/types/bills";
import { calculateGSTFromTotal } from "@/utils/gst";

export function useCartCalculations(selectedProducts: BillProduct[]) {
  const [discount, setDiscount] = useState(0);

  const subtotal = selectedProducts.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  const { gstAmount, totalAmount: finalTotal } = calculateGSTFromTotal(subtotal - discount);

  return {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal
  };
}