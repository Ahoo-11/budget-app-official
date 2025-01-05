import { useState } from "react";

export const useCartPayment = () => {
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    paidAmount,
    setPaidAmount,
    isSubmitting,
    setIsSubmitting
  };
};