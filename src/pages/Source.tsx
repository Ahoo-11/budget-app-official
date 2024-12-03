import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useState } from "react";
import { Transaction } from "@/types/transaction";

const Source = () => {
  const { sourceId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AddTransaction
        isOpen={true}
        onClose={() => {}}
        onAdd={handleAddTransaction}
        sourceId={sourceId}
      />
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
      />
    </motion.div>
  );
};

export default Source;