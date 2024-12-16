import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { Source } from "@/types/source";

export default function Personal() {
  const session = useSession();

  // First fetch the personal source
  const { data: personalSource, isLoading: isLoadingSource } = useQuery({
    queryKey: ['personal-source'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('name', 'Personal')
        .single();
      
      if (error) throw error;
      return data as Source;
    },
    enabled: !!session?.user?.id
  });

  // Then use the personal source ID to fetch transactions
  const { transactions, isLoading: isLoadingTransactions, addTransaction, deleteTransaction } = useTransactions(personalSource?.id);

  if (isLoadingSource || isLoadingTransactions) {
    return <div>Loading...</div>;
  }

  if (!personalSource) {
    return <div>Personal source not found</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Transaction</h2>
        <AddTransaction
          isOpen={true}
          onClose={() => {}}
          onAdd={addTransaction}
          source_id={personalSource.id}
        />
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}