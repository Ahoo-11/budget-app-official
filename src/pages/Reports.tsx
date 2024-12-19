import { useState } from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
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

const Reports = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedSource, setSelectedSource] = useState("");
  const { transactions } = useTransactions();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!date.from || transactionDate >= date.from) && 
                            (!date.to || transactionDate <= date.to);
    const matchesSource = !selectedSource || transaction.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  const downloadCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        "Date",
        "Description",
        "Type",
        "Category",
        "Amount"
      ].join(",");

      // Convert transactions to CSV rows
      const rows = filteredTransactions.map(transaction => {
        return [
          format(new Date(transaction.date), "yyyy-MM-dd"),
          `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in description
          transaction.type,
          transaction.category || "-",
          transaction.type === "income" ? transaction.amount : -transaction.amount
        ].join(",");
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <StatsHeader />
        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />
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
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>{transaction.category || "-"}</TableCell>
                    <TableCell className={`text-right ${
                      transaction.type === "income" ? "text-success" : "text-danger"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(Number(transaction.amount)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;