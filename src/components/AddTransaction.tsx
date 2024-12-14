import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { useUser } from "@supabase/auth-helpers-react";

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  sourceId?: string;
}

const AddTransaction = ({ isOpen, onClose, onAdd, sourceId }: AddTransactionProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const user = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const transaction = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      user_id: user.id,
      source_id: sourceId || 'personal',
      date: new Date().toISOString(),
    };

    onAdd(transaction);
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="transaction-form-description">
        <DialogTitle>Add Transaction</DialogTitle>
        <p id="transaction-form-description" className="text-sm text-muted-foreground">
          Enter the details of your new transaction below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <Select
              value={type}
              onValueChange={(value: "income" | "expense") => setType(value)}
            >
              <SelectTrigger id="type" aria-label="Select transaction type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income" textValue="Income">
                  Income
                </SelectItem>
                <SelectItem value="expense" textValue="Expense">
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" aria-label="Select transaction category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food" textValue="Food">
                  Food
                </SelectItem>
                <SelectItem value="transport" textValue="Transport">
                  Transport
                </SelectItem>
                <SelectItem value="entertainment" textValue="Entertainment">
                  Entertainment
                </SelectItem>
                <SelectItem value="utilities" textValue="Utilities">
                  Utilities
                </SelectItem>
                <SelectItem value="other" textValue="Other">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Transaction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransaction;