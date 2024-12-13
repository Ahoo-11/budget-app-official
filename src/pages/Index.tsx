import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@/types/transaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsAddingTransaction(false);
      toast({
        title: "Transaction added",
        description: "Your transaction has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted.",
      });
    }
  });

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransactionMutation.mutate(transaction);
  };

  const deleteTransaction = (id: string) => {
    deleteTransactionMutation.mutate(id);
  };

  const totalExpenses = transactions.reduce(
    (sum, t) => (t.type === "expense" ? sum + Number(t.amount) : sum),
    0
  );

  const totalIncome = transactions.reduce(
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Recent Transactions</h2>
          <button
            onClick={() => setIsAddingTransaction(true)}
            className="button-hover inline-flex items-center gap-2 bg-success text-white px-4 py-2 rounded-full"
          >
            <PlusCircle className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        <TransactionList 
          transactions={transactions} 
          onDelete={deleteTransaction}
        />

        <AddTransaction
          isOpen={isAddingTransaction}
          onClose={() => setIsAddingTransaction(false)}
          onAdd={addTransaction}
        />
      </motion.div>
    </div>
  );
};

export default Index;