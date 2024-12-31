import { useState } from "react";
import { motion } from "framer-motion";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { FiltersCard } from "@/components/stats/FiltersCard";

const Index = () => {
  const [selectedSource, setSelectedSource] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { transactions, isLoading } = useTransactions();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!date?.from || transactionDate >= date.from) && 
                            (!date?.to || transactionDate <= date.to);
    const matchesSource = !selectedSource || transaction.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <header className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1 text-sm bg-success/10 text-success rounded-full">
              Track Your Expenses
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Recent Transactions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep track of your recent expenses and income with our beautiful and intuitive
            interface.
          </p>
        </header>

        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />

        <Card className="p-6">
          <TransactionList 
            transactions={filteredTransactions}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;