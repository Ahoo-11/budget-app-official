import { BillProduct } from "@/types/bills";

export const calculateSubtotal = (products: BillProduct[]) => {
  return products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
};

export const calculateGST = (products: BillProduct[]) => {
  const subtotal = calculateSubtotal(products);
  return subtotal * 0.1; // 10% GST
};

export const calculateTotal = (products: BillProduct[]) => {
  const subtotal = calculateSubtotal(products);
  const gst = calculateGST(products);
  return subtotal + gst;
};
