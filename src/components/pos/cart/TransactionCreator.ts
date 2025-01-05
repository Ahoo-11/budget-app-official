import { useEffect, useState } from "react";
import { Bill, BillProduct } from '@/types/bills';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransactionCreatorProps {
  onTransactionCreated: (transaction: Bill) => void;
}

export const TransactionCreator = ({ onTransactionCreated }: TransactionCreatorProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<BillProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSelect = (product: BillProduct) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            description,
            amount: parseFloat(amount),
            products: selectedProducts.map(product => product.id),
          },
        ]);

      if (error) throw error;

      onTransactionCreated(data[0]);
      setDescription("");
      setAmount("");
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter transaction description"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label>Amount (MVR)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={isSubmitting}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Transaction"}
      </Button>
    </div>
  );
};
