import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import AddTransaction from "@/components/AddTransaction";
import { TransactionList } from "@/components/TransactionList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/types/transaction";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { SourceSelector } from "@/components/SourceSelector";
import { Card } from "@/components/ui/card";
import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";

const Index = () => {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedSource, setSelectedSource] = useState("");
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

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
            Financial Overview
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep track of your expenses and income with our beautiful and intuitive
            interface.
          </p>
        </header>

        <DailyTransactionsChart 
          transactions={filteredTransactions}
          dateRange={date}
          onDateRangeChange={setDate}
        />

        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <SourceSelector
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <motion.div
              className="p-6 rounded-2xl bg-white shadow-sm border card-hover"
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
              className="p-6 rounded-2xl bg-white shadow-sm border card-hover"
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
              className="p-6 rounded-2xl bg-white shadow-sm border card-hover"
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

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Transactions</h2>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddingTransaction(true);
              }}
              className="button-hover inline-flex items-center gap-2 bg-success text-white px-4 py-2 rounded-full"
            >
              <PlusCircle className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          <TransactionList 
            transactions={filteredTransactions} 
            onDelete={deleteTransaction}
            onEdit={handleEdit}
          />
        </Card>

        <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </DialogTitle>
            </DialogHeader>
            <AddTransaction
              isOpen={isAddingTransaction}
              onClose={() => {
                setIsAddingTransaction(false);
                setEditingTransaction(null);
              }}
              onAdd={addTransaction}
              onUpdate={updateTransaction}
              editingTransaction={editingTransaction}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Index;