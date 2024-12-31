export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type?: 'product' | 'service';
}