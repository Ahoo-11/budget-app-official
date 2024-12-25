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
import { Loader2 } from "lucide-react";

export default function Personal() {
  const session = useSession();
  const { toast } = useToast();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // First fetch the personal source
  const { data: personalSource, isLoading: isLoadingSource, error } = useQuery({
    queryKey: ['personal-source'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('name', 'Personal')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching personal source:', error);
        toast({
          title: "Error",
          description: "Failed to fetch personal source. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        // If no personal source exists, create one
        const { data: newSource, error: createError } = await supabase
          .from('sources')
          .insert([
            { name: 'Personal', user_id: session?.user?.id }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating personal source:', createError);
          toast({
            title: "Error",
            description: "Failed to create personal source. Please try again.",
            variant: "destructive",
          });
          throw createError;
        }

        return newSource as Source;
      }

      return data as Source;
    },
    enabled: !!session?.user?.id
  });

  // Then use the personal source ID to fetch transactions
  const { transactions, isLoading: isLoadingTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions(personalSource?.id);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Please sign in to view your personal transactions.
      </div>
    );
  }

  if (isLoadingSource || isLoadingTransactions) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Error loading personal transactions. Please try refreshing the page.
      </div>
    );
  }

  if (!personalSource) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Personal source not available. Please contact support.
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-card rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">Personal Transactions</h2>
        <AddTransaction
          isOpen={true}
          onClose={() => {}}
          onAdd={addTransaction}
          source_id={personalSource.id}
          editingTransaction={editingTransaction}
          onUpdate={updateTransaction}
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
            onUpdate={updateTransaction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}