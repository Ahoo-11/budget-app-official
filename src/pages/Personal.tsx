import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";

export default function Personal() {
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions('personal');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">Add Transaction</h2>
        <AddTransaction
          isOpen={true}
          onClose={() => {}}
          onAdd={addTransaction}
          source_id="personal"
        />
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}