import { Card } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface TransactionReportsProps {
  transactions: Transaction[];
  dateRange: DateRange | undefined;
}

export const TransactionReports = ({
  transactions,
  dateRange,
}: TransactionReportsProps) => {
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!dateRange?.from || transactionDate >= dateRange.from) &&
      (!dateRange?.to || transactionDate <= dateRange.to)
    );
  });

  const downloadCSV = () => {
    try {
      const headers = [
        "Date",
        "Description",
        "Type",
        "Category",
        "Amount",
      ].join(",");

      const rows = filteredTransactions.map((transaction) => {
        return [
          format(new Date(transaction.date), "yyyy-MM-dd"),
          `"${transaction.description.replace(/"/g, '""')}"`,
          transaction.type,
          transaction.category || "-",
          transaction.type === "income"
            ? transaction.amount
            : -transaction.amount,
        ].join(",");
      });

      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Your transactions have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Transaction Reports</h3>
        <Button onClick={downloadCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), "PPP")}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="capitalize">
                  {transaction.type}
                </TableCell>
                <TableCell>{transaction.category || "-"}</TableCell>
                <TableCell
                  className={`text-right ${
                    transaction.type === "income"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {Math.abs(Number(transaction.amount)).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};