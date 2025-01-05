import { Transaction } from "@/types/transaction";
import { useToast } from "@/components/ui/use-toast";
import { TransactionItem } from "./transaction/TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, onDelete, onEdit }: TransactionListProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  // Sort transactions by date in descending order and filter out child transactions
  const sortedTransactions = [...transactions]
    .filter(t => !t.parent_transaction_id) // Only show parent transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!sortedTransactions.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTransactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={() => handleDelete(transaction.id)}
          onEdit={() => onEdit?.(transaction)}
        />
      ))}
    </div>
  );
};