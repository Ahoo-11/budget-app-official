import { Button } from "@/components/ui/button";

interface TransactionTypeSelectorProps {
  type: "income" | "expense";
  setType: (type: "income" | "expense") => void;
}

export const TransactionTypeSelector = ({ type, setType }: TransactionTypeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Type</label>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => setType("expense")}
          variant="outline"
          className={`p-3 rounded-xl border transition-all ${
            type === "expense"
              ? "border-danger bg-danger/10 text-danger"
              : "hover:border-danger/50"
          }`}
        >
          Expense
        </Button>
        <Button
          type="button"
          onClick={() => setType("income")}
          variant="outline"
          className={`p-3 rounded-xl border transition-all ${
            type === "income"
              ? "border-success bg-success/10 text-success"
              : "hover:border-success/50"
          }`}
        >
          Income
        </Button>
      </div>
    </div>
  );
};