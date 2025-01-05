import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, TransactionStatus } from "@/types/transaction";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

export const useTransactions = (source_id?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', source_id],
    queryFn: async () => {
      console.log('Fetching transactions for source:', source_id);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (source_id) {
        query = query.eq('source_id', source_id);
      } else {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session?.user?.id)
          .single();

        console.log('User role:', userRole);

        if (userRole?.role === 'controller' || userRole?.role === 'super_admin') {
          // Controller and super_admin can access all sources
          console.log('User is controller/super_admin, fetching all transactions');
        } else {
          const { data: permissions } = await supabase
            .from('source_permissions')
            .select('source_id')
            .eq('user_id', session?.user?.id);

          console.log('User permissions:', permissions);

          if (permissions && permissions.length > 0) {
            const sourceIds = permissions.map(p => p.source_id);
            query = query.in('source_id', sourceIds);
            console.log('Filtering by source IDs:', sourceIds);
          } else {
            console.log('No source permissions found, returning empty array');
            return [];
          }
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log('Fetched transactions:', data);
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
        status: transaction.status || 'pending',
        user_id: session?.user?.id
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
    onSuccess: (data) => {
      // Invalidate both general and source-specific queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (data?.source_id) {
        queryClient.invalidateQueries({ queryKey: ['transactions', data.source_id] });
      }
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
    mutationFn: async (transaction: Transaction) => {
      const { id, ...updateData } = transaction;
      const cleanTransaction = {
        ...updateData,
        amount: parseFloat(updateData.amount.toString()),
        category_id: updateData.category_id || null,
        payer_id: updateData.payer_id || null,
        status: updateData.status || 'pending',
        user_id: session?.user?.id
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(cleanTransaction)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate both general and source-specific queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (data?.source_id) {
        queryClient.invalidateQueries({ queryKey: ['transactions', data.source_id] });
      }
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
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate both general and source-specific queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (data?.source_id) {
        queryClient.invalidateQueries({ queryKey: ['transactions', data.source_id] });
      }
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