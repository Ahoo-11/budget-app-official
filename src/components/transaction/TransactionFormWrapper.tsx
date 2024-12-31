import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/transaction";
import { TransactionTypeSelector } from "../TransactionTypeSelector";
import { SourceSelector } from "../SourceSelector";
import { PayerSelector } from "../PayerSelector";
import { CategorySelector } from "../CategorySelector";
import { TransactionForm } from "../TransactionForm";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState(source_id || "");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("Unknown User");
  const session = useSession();
  const { toast } = useToast();

  // Fetch source template to determine if it's product-based
  const { data: sourceTemplate } = useQuery<SourceTemplate>({
    queryKey: ['source-template', selectedSource || source_id],
    queryFn: async () => {
      if (!selectedSource && !source_id) return { template_id: '', templates: null };
      
      const { data, error } = await supabase
        .from('source_templates')
        .select(`
          template_id,
          templates (
            type,
            config
          )
        `)
        .eq('source_id', selectedSource || source_id)
        .single();

      if (error) {
        console.error('Error fetching source template:', error);
        return { template_id: '', templates: null };
      }

      // Transform the config from JSON to BusinessTemplateConfig
      if (data?.templates?.config) {
        const config = typeof data.templates.config === 'string' 
          ? JSON.parse(data.templates.config) 
          : data.templates.config;

        return {
          template_id: data.template_id,
          templates: {
            type: data.templates.type,
            config: config as BusinessTemplateConfig
          }
        };
      }

      return { template_id: '', templates: null };
    },
    enabled: !!(selectedSource || source_id)
  });

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
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
    }
  }, [editingTransaction]);

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

    // Validate required fields
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSource && !source_id) {
      toast({
        title: "Validation Error",
        description: "Please select a source",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const transactionData = {
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        category_id: selectedCategory || null,
        payer_id: selectedPayer || null,
        date: date.toISOString(),
        source_id: source_id || selectedSource,
        user_id: session.user.id,
        created_by_name: displayName
      };

      // Only create stock movements if this is a product-based source
      const isProductBased = sourceTemplate?.templates?.config?.productBased === true;

      if (editingTransaction && onUpdate) {
        await onUpdate({
          ...transactionData,
          id: editingTransaction.id,
          created_at: editingTransaction.created_at,
          created_by_name: displayName
        });
      } else {
        await onAdd(transactionData);
      }
      
      // Reset form
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
      setSelectedSource(source_id || "");
      setSelectedPayer("");
      setSelectedCategory("");
      setDate(new Date());
      
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
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        isEditing={!!editingTransaction}
      />
    </form>
  );
};