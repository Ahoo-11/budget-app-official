import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AddTransaction from "@/components/AddTransaction";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source as SourceType } from "@/types/source";
import { Transaction } from "@/types/transaction";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductGrid } from "@/components/products/ProductGrid";
import { OrderInterface } from "@/components/pos/OrderInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Source = () => {
  const { sourceId } = useParams();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">{source?.name || 'Loading...'}</h2>
        
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="pos">POS</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <AddTransaction
              isOpen={true}
              onClose={() => {}}
              onAdd={addTransaction}
              source_id={sourceId}
              editingTransaction={editingTransaction}
            />
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="pos">
            <OrderInterface sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="products">
            <ProductGrid sourceId={sourceId!} />
          </TabsContent>
        </Tabs>
      </div>

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
            source_id={sourceId}
            editingTransaction={editingTransaction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Source;