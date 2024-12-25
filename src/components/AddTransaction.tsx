import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";
import { TransactionFormWrapper } from "./transaction/TransactionFormWrapper";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full"
        >
          <TransactionFormWrapper
            onAdd={onAdd}
            onUpdate={onUpdate}
            source_id={source_id}
            editingTransaction={editingTransaction}
            onClose={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;