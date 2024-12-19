import { useState } from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Reports = () => {
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
          <h3 className="text-lg font-semibold mb-6">Transaction Reports</h3>
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