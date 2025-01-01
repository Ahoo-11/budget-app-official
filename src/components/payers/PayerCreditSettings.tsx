import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PayerCreditSettings as PayerCreditSettingsType } from "@/types/payer";

interface PayerCreditSettingsProps {
  sourceId: string;
  payerId: string;
}

export const PayerCreditSettings = ({ sourceId, payerId }: PayerCreditSettingsProps) => {
  const [creditDays, setCreditDays] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['payer-credit-settings', sourceId, payerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('source_payer_settings')
        .select('*')
        .eq('source_id', sourceId)
        .eq('payer_id', payerId)
        .single();

      if (error) throw error;
      return data as PayerCreditSettingsType;
    },
    enabled: !!sourceId && !!payerId
  });

  // Update credit days when settings change
  useEffect(() => {
    if (settings) {
      setCreditDays(settings.credit_days);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('source_payer_settings')
        .upsert({
          source_id: sourceId,
          payer_id: payerId,
          credit_days: creditDays
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payer-credit-settings', sourceId, payerId] });
      toast({
        title: "Success",
        description: "Credit settings updated successfully",
      });
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Credit Days</label>
        <Input
          type="number"
          min="1"
          value={creditDays}
          onChange={(e) => setCreditDays(parseInt(e.target.value) || 1)}
          className="w-full"
        />
      </div>
      <Button 
        onClick={() => updateSettings.mutate()}
        disabled={updateSettings.isPending}
      >
        Save Settings
      </Button>
    </div>
  );
};
