import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionItem = ({ transaction, onDelete, onEdit }: TransactionItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "partially_paid":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-full ${
            transaction.type === "income" ? "bg-success/20" : "bg-destructive/20"
          }`}
        >
          {transaction.type === "income" ? (
            <ArrowUpIcon className="w-4 h-4 text-success" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-destructive" />
          )}
        </div>

        <div>
          <div className="font-medium">{transaction.description}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(transaction.date), "PPP")}
          </div>
          {transaction.category && (
            <div className="text-sm text-muted-foreground">{transaction.category}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className={getStatusColor(transaction.status)}>
          {transaction.status}
        </Badge>

        {transaction.document_url && (
          <a
            href={transaction.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <FileIcon className="w-4 h-4" />
          </a>
        )}

        <div className="text-right">
          <div
            className={`font-medium ${
              transaction.type === "income" ? "text-success" : "text-destructive"
            }`}
          >
            ${transaction.amount.toFixed(2)}
          </div>
          {transaction.remaining_amount !== null && (
            <div className="text-sm text-muted-foreground">
              Remaining: ${transaction.remaining_amount?.toFixed(2)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};