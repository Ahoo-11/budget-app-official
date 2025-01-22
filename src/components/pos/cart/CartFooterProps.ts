export interface CartFooterProps {
  subtotal: number;
  gstAmount: number;
  discount: number;
  finalTotal: number;
  setDiscount: (discount: number) => void;
  sourceId: string;
  products: BillProduct[];
  onProductsChange: (products: BillProduct[]) => void;
  paymentMethod: 'cash' | 'transfer';
  isBillSubmitting: boolean;
}