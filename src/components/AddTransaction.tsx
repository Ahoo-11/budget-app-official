import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
}

const AddTransaction = ({ isOpen, onClose, onAdd }: AddTransactionProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };
    onAdd(transaction);
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Add Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                />
              </div>

              <button
                type="submit"
                className="w-full bg-success text-white p-3 rounded-xl button-hover"
              >
                Add Transaction
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;