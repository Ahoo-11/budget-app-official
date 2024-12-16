import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/types/source";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const user = useUser();
  const { toast } = useToast();

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Source[];
    },
    enabled: !!user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
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
        user_id: user.id,
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
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`p-3 rounded-xl border transition-all ${
                    type === "expense"
                      ? "border-danger bg-danger/10 text-danger"
                      : "hover:border-danger/50"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`p-3 rounded-xl border transition-all ${
                    type === "income"
                      ? "border-success bg-success/10 text-success"
                      : "hover:border-success/50"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {!source_id && (
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
                  required
                >
                  <option value="">Select a source</option>
                  <option value="personal">Personal</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
                placeholder="Enter description"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
                placeholder="Enter amount"
                required
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
                placeholder="Enter category"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-success text-white p-3 rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;