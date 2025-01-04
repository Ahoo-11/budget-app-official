import { useState, useEffect } from "react";
import { Transaction, TransactionStatus } from "@/types/transaction";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

export const useTransactionForm = (editingTransaction?: Transaction | null) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("Unknown User");
  const [status, setStatus] = useState<TransactionStatus>("pending");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const session = useSession();

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();
        
        if (data?.display_name) {
          setDisplayName(data.display_name);
        }
      }
    };
    
    fetchDisplayName();
  }, [session?.user?.id]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type as "income" | "expense");
      setCategory(editingTransaction.category || "");
      setSelectedSource(editingTransaction.source_id);
      setSelectedPayer(editingTransaction.payer_id || "");
      setSelectedCategory(editingTransaction.category_id || "");
      setDate(new Date(editingTransaction.date));
      setStatus(editingTransaction.status);
      setIsRecurring(editingTransaction.is_recurring || false);
      setRecurringFrequency(editingTransaction.recurring_frequency || "");
    }
  }, [editingTransaction]);

  return {
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    category,
    setCategory,
    selectedSource,
    setSelectedSource,
    selectedPayer,
    setSelectedPayer,
    selectedCategory,
    setSelectedCategory,
    date,
    setDate,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
    displayName,
    isRecurring,
    setIsRecurring,
    recurringFrequency,
    setRecurringFrequency,
  };
};