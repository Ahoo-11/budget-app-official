import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/transaction";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

export const useTransactions = (source_id?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', source_id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (source_id) {
        query = query.eq('source_id', source_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Transaction[];
    },
    enabled: !!session?.user?.id
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to add transactions");
      }

      const parsedAmount = parseFloat(transaction.amount.toString());
      if (isNaN(parsedAmount)) {
        throw new Error("Invalid amount value");
      }

      const cleanTransaction = {
        ...transaction,
        amount: parsedAmount,
        category_id: transaction.category_id || null,
        payer_id: transaction.payer_id || null,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([cleanTransaction])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...transaction }: Transaction) => {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to update transactions");
      }

      const parsedAmount = parseFloat(transaction.amount.toString());
      if (isNaN(parsedAmount)) {
        throw new Error("Invalid amount value");
      }

      const cleanTransaction = {
        ...transaction,
        amount: parsedAmount,
        category_id: transaction.category_id || null,
        payer_id: transaction.payer_id || null,
        user_id: session.user.id,
      };

      const { error } = await supabase
        .from('transactions')
        .update(cleanTransaction)
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to delete transactions");
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    transactions,
    isLoading,
    addTransaction: addTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
  };
};