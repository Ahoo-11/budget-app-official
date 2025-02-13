import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SourceType {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SourcePayerSetting {
  id: string;
  source_id: string;
  payer_id: string;
  credit_days: number;
  created_at: string | null;
  updated_at: string | null;
}

export const useTypes = (sourceId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all source types
  const { 
    data: types = [], 
    isLoading: isLoadingTypes,
    error: typesError 
  } = useQuery({
    queryKey: ["source-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_source_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as SourceType[];
    },
  });

  // Fetch source payer settings for a specific source
  const { 
    data: typeSettings = [], 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: ["source-payer-settings", sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      
      const { data, error } = await supabase
        .from("budgetapp_source_payer_settings")
        .select("*")
        .eq("source_id", sourceId);

      if (error) throw error;
      return data as SourcePayerSetting[];
    },
    enabled: !!sourceId,
  });

  // Check if a type is enabled for a source
  const isTypeEnabled = (typeId: string) => {
    if (!sourceId) return true;
    const setting = typeSettings.find(
      (s) => s.payer_id === typeId
    );
    return setting ? setting.credit_days > 0 : false;
  };

  // Toggle type enabled/disabled status
  const toggleType = async (typeId: string, isEnabled: boolean) => {
    if (!sourceId) return;

    try {
      // First, check if a setting already exists
      const { data: existingSettings, error: checkError } = await supabase
        .from("budgetapp_source_payer_settings")
        .select("*")
        .eq("source_id", sourceId)
        .eq("payer_id", typeId);

      if (checkError) throw checkError;

      if (existingSettings && existingSettings.length > 0) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from("budgetapp_source_payer_settings")
          .update({ credit_days: isEnabled ? 1 : 0 })
          .eq("source_id", sourceId)
          .eq("payer_id", typeId);

        if (updateError) throw updateError;
      } else {
        // Insert new setting
        const { error: insertError } = await supabase
          .from("budgetapp_source_payer_settings")
          .insert({
            source_id: sourceId,
            payer_id: typeId,
            credit_days: isEnabled ? 1 : 0,
          });

        if (insertError) throw insertError;
      }

      await queryClient.invalidateQueries({ queryKey: ["source-payer-settings", sourceId] });

      toast({
        title: "Success",
        description: `Type ${isEnabled ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling type:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update type settings",
      });
    }
  };

  return {
    types,
    isLoadingTypes,
    typesError,
    isLoadingSettings,
    settingsError,
    isTypeEnabled,
    toggleType,
    // Backward compatibility
    incomeTypes: types,
    isIncomeTypeEnabled: isTypeEnabled,
  };
};

// Re-export for backward compatibility
export const useIncomeTypes = useTypes;
