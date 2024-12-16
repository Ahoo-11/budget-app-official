import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TransactionFormProps {
  description: string;
  setDescription: (description: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  category: string;
  setCategory: (category: string) => void;
  isSubmitting: boolean;
}

export const TransactionForm = ({
  description,
  setDescription,
  amount,
  setAmount,
  category,
  setCategory,
  isSubmitting,
}: TransactionFormProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
          placeholder="Enter description"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
          placeholder="Enter amount"
          required
          min="0"
          step="0.01"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
          placeholder="Enter category"
          required
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-success text-white p-3 rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Transaction"
        )}
      </Button>
    </>
  );
};