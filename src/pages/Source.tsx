import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AddTransaction from "@/components/AddTransaction";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source as SourceType } from "@/types/source";

const Source = () => {
  const { sourceId } = useParams();
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions(sourceId);

  const { data: source } = useQuery({
    queryKey: ['source', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();
      
      if (error) throw error;
      return data as SourceType;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">{source?.name || 'Loading...'}</h2>
        <AddTransaction
          isOpen={true}
          onClose={() => {}}
          onAdd={addTransaction}
          source_id={sourceId}
        />
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
};

export default Source;