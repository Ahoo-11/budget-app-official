import { Transaction } from "@/types/transaction";
import { ArrowUpRight, ArrowDownRight, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TransactionItem = ({ transaction, onDelete, onEdit }: TransactionItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-full ${
            transaction.type === "income"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {transaction.type === "income" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {transaction.category}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.date), "PPP")}
            </p>
            <p className="text-xs text-muted-foreground">
              Created by: {transaction.created_by_name}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p
          className={`font-medium ${
            transaction.type === "income"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}$
          {Math.abs(transaction.amount).toFixed(2)}
        </p>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};