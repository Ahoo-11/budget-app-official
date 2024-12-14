import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";

const Source = () => {
  const { sourceId } = useParams();
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions(sourceId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AddTransaction
        isOpen={true}
        onClose={() => {}}
        onAdd={addTransaction}
        source_id={sourceId}
      />
      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </motion.div>
  );
};

export default Source;