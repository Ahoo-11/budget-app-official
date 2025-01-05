import { Transaction, getDisplayStatus } from "@/types/transaction";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const [payerName, setPayerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayerName = async () => {
      if (transaction.payer_id) {
        const { data, error } = await supabase
          .from("payers")
          .select("name")
          .eq("id", transaction.payer_id)
          .single();

        if (!error && data) {
          setPayerName(data.name);
        }
      }
    };

    fetchPayerName();
  }, [transaction.payer_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "partially_paid":
        return "bg-purple-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const displayStatus = getDisplayStatus(transaction);

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
          {payerName && (
            <div className="text-sm text-muted-foreground">
              Payer: {payerName}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {format(new Date(transaction.date), "PPP")}
          </div>
          {transaction.category && (
            <div className="text-sm text-muted-foreground">{transaction.category}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className={getStatusColor(displayStatus)}>
          {displayStatus}
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
            MVR {transaction.amount.toFixed(2)}
          </div>
          {transaction.remaining_amount !== null && (
            <div className="text-sm text-muted-foreground">
              Remaining: MVR {transaction.remaining_amount?.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};