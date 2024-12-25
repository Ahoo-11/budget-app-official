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
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (source_id) {
        query = query.eq('source_id', source_id);
      } else {
        // If no source_id is provided, fetch transactions from all sources the user has access to
        const { data: permissions } = await supabase
          .from('source_permissions')
          .select('source_id')
          .eq('user_id', session?.user?.id)
          .eq('can_view', true);

        if (permissions && permissions.length > 0) {
          const sourceIds = permissions.map(p => p.source_id);
          query = query.in('source_id', sourceIds);
        }
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
      const cleanTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount.toString()),
        category_id: transaction.category_id || null,
        payer_id: transaction.payer_id || null,
        user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000'
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
      const cleanTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount.toString()),
        category_id: transaction.category_id || null,
        payer_id: transaction.payer_id || null,
        user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000'
      };

      const { error } = await supabase
        .from('transactions')
        .update(cleanTransaction)
        .eq('id', id);

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
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
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
