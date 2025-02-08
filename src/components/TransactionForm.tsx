import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelector } from "./CategorySelector";
import { SourceSelector } from "./SourceSelector";
import { PayerSelector } from "./PayerSelector";

const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  source_id: z.string().min(1, "Source is required"),
  payer_id: z.string().min(1, "Payer is required"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: TransactionFormValues;
}

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      amount: "",
      description: "",
      category_id: "",
      source_id: "",
      payer_id: "",
      notes: "",
    },
  });

  const { data: currentUserRole } = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roleData, error: roleError } = await supabase
        .schema('budget')
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      return roleData?.role ?? null;
    }
  });

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .schema('budget')
        .from('transactions')
        .insert({
          amount: parseFloat(data.amount),
          description: data.description,
          category_id: data.category_id,
          source_id: data.source_id,
          payer_id: data.payer_id,
          notes: data.notes,
          created_by: user.id,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction. Please try again.",
      });
    }
  };

  if (!currentUserRole) {
    return (
      <div className="text-center py-4">
        Loading...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Transaction description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <SourceSelector
                  selectedSource={field.value}
                  setSelectedSource={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  sourceId={form.watch("source_id")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payer</FormLabel>
              <FormControl>
                <PayerSelector
                  selectedPayer={field.value}
                  setSelectedPayer={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
