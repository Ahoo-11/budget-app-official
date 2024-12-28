import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { addDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { StatsHeader } from "@/components/stats/StatsHeader";

const Stats = () => {
  const [selectedSource, setSelectedSource] = useState("");
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { transactions, isLoading } = useTransactions();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!date.from || transactionDate >= date.from) && 
                            (!date.to || transactionDate <= date.to);
    const matchesSource = !selectedSource || transaction.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  const totalExpenses = filteredTransactions.reduce(
    (sum, t) => (t.type === "expense" ? sum + Number(t.amount) : sum),
    0
  );

  const totalIncome = filteredTransactions.reduce(
    (sum, t) => (t.type === "income" ? sum + Number(t.amount) : sum),
    0
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Financial Statistics
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Detailed overview of your financial performance across all sources.
          </p>
        </header>

        <StatsHeader />

        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />

        <DailyTransactionsChart 
          transactions={filteredTransactions}
          dateRange={date}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div
            className="p-6 rounded-2xl bg-white shadow-sm border card-hover dark:bg-gray-800"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-semibold">
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-2xl bg-white shadow-sm border card-hover dark:bg-gray-800"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-danger/10">
                <CreditCard className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-semibold">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-2xl bg-white shadow-sm border card-hover dark:bg-gray-800"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-semibold">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Stats;