export const GST_PERCENTAGE = 8;

export const calculateGSTFromTotal = (totalAmount: number) => {
  const gstAmount = (totalAmount * GST_PERCENTAGE) / (100 + GST_PERCENTAGE);
  const baseAmount = totalAmount - gstAmount;
  return {
    totalAmount,
    baseAmount,
    gstAmount
  };
};
