import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import AddTransaction from "@/components/AddTransaction";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { Source } from "@/types/source";
import { Transaction } from "@/types/transaction";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function Personal() {
  const session = useSession();
  const { toast } = useToast();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // First fetch the personal source - using maybeSingle() and taking the first created one if multiple exist
  const { data: personalSource, isLoading: isLoadingSource } = useQuery({
    queryKey: ['personal-source'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('name', 'Personal')
        .order('created_at', { ascending: true })
        .limit(1);
      
      if (error) {
        console.error('Error fetching personal source:', error);
        toast({
          title: "Error",
          description: "Failed to fetch personal source. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "Personal source not found.",
          variant: "destructive",
        });
        return null;
      }

      return data[0] as Source;
    },
    enabled: !!session?.user?.id
  });

  // Then use the personal source ID to fetch transactions
  const { transactions, isLoading: isLoadingTransactions, addTransaction, deleteTransaction } = useTransactions(personalSource?.id);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

  if (isLoadingSource || isLoadingTransactions) {
    return <div>Loading...</div>;
  }

  if (!personalSource) {
    return <div>Personal source not found</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">Personal Transactions</h2>
        <AddTransaction
          isOpen={true}
          onClose={() => {}}
          onAdd={addTransaction}
          source_id={personalSource.id}
          editingTransaction={editingTransaction}
        />
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
        onEdit={handleEdit}
      />

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
            source_id={personalSource.id}
            editingTransaction={editingTransaction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}