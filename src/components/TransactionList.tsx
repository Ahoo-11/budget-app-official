import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-muted-foreground"
      >
        No transactions yet. Add your first transaction to get started.
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white shadow-sm border card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-xl ${
                    transaction.type === "income"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg font-semibold ${
                  transaction.type === "income" ? "text-success" : "text-danger"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TransactionList;