import { useState } from "react";
import { BillProduct } from "@/types/bills";
import { calculateGSTFromTotal } from "@/utils/gst";

export function useCartCalculations(selectedProducts: BillProduct[]) {
  const [discount, setDiscount] = useState(0);

  const subtotal = selectedProducts.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  // Calculate GST after discount
  const discountedTotal = subtotal - discount;
  const { gstAmount, totalAmount: finalTotal } = calculateGSTFromTotal(discountedTotal);

  return {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal,
    discountedTotal
  };
}