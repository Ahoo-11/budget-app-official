import { useState } from "react";
import { BillProduct } from "@/types/bill";

export const useCartCalculations = (items: BillProduct[]) => {
  const [discount, setDiscount] = useState<number>(0);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.08; // 8% GST
  const discountedTotal = subtotal - discount; // First apply discount
  const gstAmount = (discountedTotal * gstRate); // Calculate 8% of the discounted total
  const finalTotal = discountedTotal + gstAmount; // Add GST to get final total

  return {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal
  };
};