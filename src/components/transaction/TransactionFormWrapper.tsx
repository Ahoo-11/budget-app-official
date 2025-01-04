import { useSession } from "@supabase/auth-helpers-react";
import { Transaction } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { TransactionFormContent } from "./TransactionFormContent";
import { BusinessTemplateConfig } from "@/types/template-config";

interface TransactionFormWrapperProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  onUpdate?: (transaction: Transaction) => void;
  source_id?: string;
  editingTransaction?: Transaction | null;
  onClose?: () => void;
}

interface SourceTemplate {
  template_id: string;
  templates: {
    type: 'business' | 'personal';
    config: BusinessTemplateConfig;
  } | null;
}

export const TransactionFormWrapper = ({
  onAdd,
  onUpdate,
  source_id,
  editingTransaction,
  onClose,
}: TransactionFormWrapperProps) => {
  const session = useSession();
  const { toast } = useToast();
  const formState = useTransactionForm(editingTransaction);

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

    if (!formState.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseFloat(formState.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (!formState.selectedSource && !source_id) {
      toast({
        title: "Validation Error",
        description: "Please select a source",
        variant: "destructive"
      });
      return;
    }

    if (formState.isRecurring && !formState.recurringFrequency) {
      toast({
        title: "Validation Error",
        description: "Please select a frequency for recurring transactions",
        variant: "destructive"
      });
      return;
    }
    
    formState.setIsSubmitting(true);
    try {
      const transactionData = {
        description: formState.description.trim(),
        amount: parsedAmount,
        type: formState.type,
        category: formState.category,
        category_id: formState.selectedCategory || null,
        payer_id: formState.selectedPayer || null,
        date: formState.date.toISOString(),
        source_id: source_id || formState.selectedSource,
        user_id: session.user.id,
        created_by_name: formState.displayName,
        status: formState.status,
        is_recurring: formState.isRecurring,
        recurring_frequency: formState.isRecurring ? formState.recurringFrequency : null,
        next_occurrence: formState.isRecurring ? formState.date.toISOString() : null
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
      
      formState.setDescription("");
      formState.setAmount("");
      formState.setType("expense");
      formState.setCategory("");
      formState.setSelectedSource(source_id || "");
      formState.setSelectedPayer("");
      formState.setSelectedCategory("");
      formState.setDate(new Date());
      formState.setStatus("pending");
      formState.setIsRecurring(false);
      formState.setRecurringFrequency("");
      
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
      formState.setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionFormContent
        {...formState}
        source_id={source_id}
        isEditing={!!editingTransaction}
      />
    </form>
  );
};
