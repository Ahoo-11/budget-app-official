import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { TransactionTypeSelector } from "./TransactionTypeSelector";
import { SourceSelector } from "./SourceSelector";
import { PayerSelector } from "./PayerSelector";
import { CategorySelector } from "./CategorySelector";
import { TransactionForm } from "./TransactionForm";

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  onUpdate?: (transaction: Transaction) => void;
  source_id?: string;
  editingTransaction?: Transaction | null;
}

const AddTransaction = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate,
  source_id, 
  editingTransaction 
}: AddTransactionProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState(source_id || "");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  // Pre-fill form when editing
  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type as "income" | "expense");
      setCategory(editingTransaction.category || "");
      setSelectedSource(editingTransaction.source_id);
      setSelectedPayer(editingTransaction.payer_id || "");
      setSelectedCategory(editingTransaction.category_id || "");
      setDate(new Date(editingTransaction.date));
    }
  }, [editingTransaction]);

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
      const transactionData = {
        description,
        amount: parseFloat(amount),
        type,
        category,
        category_id: selectedCategory,
        payer_id: selectedPayer,
        date: date.toISOString(),
        source_id: source_id || selectedSource,
        user_id: session.user.id,
      };

      if (editingTransaction && onUpdate) {
        await onUpdate({
          ...transactionData,
          id: editingTransaction.id,
          created_at: editingTransaction.created_at,
        });
      } else {
        await onAdd(transactionData);
      }
      
      // Reset form
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
      setSelectedSource(source_id || "");
      setSelectedPayer("");
      setSelectedCategory("");
      setDate(new Date());
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to handle transaction:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to handle transaction",
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
            <PayerSelector
              selectedPayer={selectedPayer}
              setSelectedPayer={setSelectedPayer}
            />
            <CategorySelector
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <TransactionForm
              description={description}
              setDescription={setDescription}
              amount={amount}
              setAmount={setAmount}
              date={date}
              setDate={setDate}
              isSubmitting={isSubmitting}
              isEditing={!!editingTransaction}
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;