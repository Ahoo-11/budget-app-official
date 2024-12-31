import { TransactionTypeSelector } from "../TransactionTypeSelector";
import { SourceSelector } from "../SourceSelector";
import { PayerSelector } from "../PayerSelector";
import { CategorySelector } from "../CategorySelector";
import { TransactionForm } from "../TransactionForm";

interface TransactionFormContentProps {
  type: "income" | "expense";
  setType: (type: "income" | "expense") => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedPayer: string;
  setSelectedPayer: (payer: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  description: string;
  setDescription: (description: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  date: Date;
  setDate: (date: Date) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  source_id?: string;
}

export const TransactionFormContent = ({
  type,
  setType,
  selectedSource,
  setSelectedSource,
  selectedPayer,
  setSelectedPayer,
  selectedCategory,
  setSelectedCategory,
  description,
  setDescription,
  amount,
  setAmount,
  date,
  setDate,
  isSubmitting,
  isEditing,
  source_id,
}: TransactionFormContentProps) => {
  return (
    <>
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
        sourceId={source_id || selectedSource}
      />
      <TransactionForm
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        date={date}
        setDate={setDate}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />
    </>
  );
};