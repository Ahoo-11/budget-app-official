import { Bill, BillProduct } from '@/types/bills';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderInterfaceProps {
  bill: Bill;
  onUpdate: (updatedBill: Bill) => void;
}

export const OrderInterface = ({ bill, onUpdate }: OrderInterfaceProps) => {
  const [products, setProducts] = useState<BillProduct[]>(bill.items);

  const handleProductChange = (index: number, field: keyof BillProduct, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const handleSave = () => {
    const updatedBill = { ...bill, items: products };
    onUpdate(updatedBill);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Order Details</h2>
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center space-x-4">
          <Input
            value={product.name}
            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
            placeholder="Product Name"
          />
          <Input
            type="number"
            value={product.price}
            onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
            placeholder="Price"
          />
          <Input
            type="number"
            value={product.quantity}
            onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
            placeholder="Quantity"
          />
          <Select
            value={product.type}
            onValueChange={(value) => handleProductChange(index, 'type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button onClick={handleSave}>Save Order</Button>
    </div>
  );
};
