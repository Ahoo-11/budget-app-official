import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@/types/transaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

const Index = () => {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
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

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
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

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <DashboardHeader />

        <DashboardStats
          totalBalance={totalIncome - totalExpenses}
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
        />

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