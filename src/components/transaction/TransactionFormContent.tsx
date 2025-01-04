import { TransactionTypeSelector } from "../TransactionTypeSelector";
import { SourceSelector } from "../SourceSelector";
import { PayerSelector } from "../PayerSelector";
import { CategorySelector } from "../CategorySelector";
import { TransactionForm } from "../TransactionForm";
import { TransactionStatus } from "@/types/transaction";
import { RecurringTransactionFields } from "./form/RecurringTransactionFields";

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
  status: TransactionStatus;
  setStatus: (status: TransactionStatus) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  source_id?: string;
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurringFrequency: string;
  setRecurringFrequency: (frequency: string) => void;
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
  status,
  setStatus,
  isSubmitting,
  isEditing,
  source_id,
  isRecurring,
  setIsRecurring,
  recurringFrequency,
  setRecurringFrequency,
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
      <RecurringTransactionFields
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        recurringFrequency={recurringFrequency}
        setRecurringFrequency={setRecurringFrequency}
        isSubmitting={isSubmitting}
      />
      <TransactionForm
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        sourceId={source_id || selectedSource}
      />
    </>
  );
};