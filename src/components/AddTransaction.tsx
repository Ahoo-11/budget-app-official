import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { TransactionTypeSelector } from "./TransactionTypeSelector";
import { SourceSelector } from "./SourceSelector";
import { TransactionForm } from "./TransactionForm";

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  source_id?: string;
}

const AddTransaction = ({ isOpen, onClose, onAdd, source_id }: AddTransactionProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState(source_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please make sure you are logged in before adding transactions.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const transaction: Omit<Transaction, 'id' | 'created_at'> = {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toISOString(),
        source_id: source_id || selectedSource,
        user_id: session.user.id,
      };

      await onAdd(transaction);
      
      // Reset form
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
      setSelectedSource(source_id || "");
      
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <TransactionTypeSelector type={type} setType={setType} />
            <SourceSelector 
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              source_id={source_id}
            />
            <TransactionForm
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              category={category}
              setCategory={setCategory}
              isSubmitting={isSubmitting}
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;