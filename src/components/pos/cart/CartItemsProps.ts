import { BillProduct } from "@/types/bills";

export interface CartItemsProps {
  products: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}