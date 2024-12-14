import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/transaction";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useToast } from "@/components/ui/use-toast";

export default function Personal() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return;
    }

    if (data) {
      // Type assertion to ensure data matches our Transaction type
      const typedData = data.map(item => ({
        ...item,
        type: item.type as "income" | "expense"
      }));
      setTransactions(typedData);
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      // Type assertion for the new transaction
      const typedData = {
        ...data,
        type: data.type as "income" | "expense"
      };
      setTransactions([typedData, ...transactions]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
      return;
    }

    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <AddTransaction
        isOpen={true}
        onClose={() => {}}
        onAdd={handleAddTransaction}
      />
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}