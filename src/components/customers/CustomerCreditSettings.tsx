import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomerCreditSettingsProps {
  customerId: string;
  sourceId: string;
  customerName: string;
}

export const CustomerCreditSettings = ({ customerId, sourceId, customerName }: CustomerCreditSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [creditDays, setCreditDays] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['customer-credit', sourceId, customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('source_customer_settings')
        .select('*')
        .eq('source_id', sourceId)
        .eq('customer_id', customerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (days: number) => {
      const { error } = await supabase
        .from('source_customer_settings')
        .upsert({
          source_id: sourceId,
          customer_id: customerId,
          credit_days: days
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-credit'] });
      toast({
        title: "Success",
        description: "Credit settings updated successfully",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update credit settings",
        variant: "destructive",
      });
      console.error('Error updating credit settings:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(creditDays);
    if (isNaN(days) || days < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of days (minimum 1)",
        variant: "destructive",
      });
      return;
    }
    updateSettings.mutate(days);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Credit Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credit Settings for {customerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Credit Days</label>
            <Input
              type="number"
              min="1"
              value={creditDays || settings?.credit_days || "1"}
              onChange={(e) => setCreditDays(e.target.value)}
              placeholder="Enter number of days"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Default is 1 day if no custom setting is specified
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};