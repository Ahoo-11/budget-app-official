import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IncomeType, IncomeTypeSettings, IncomeSubcategory } from "@/types/income";
import { useToast } from "./use-toast";

export const useIncomeTypes = (sourceId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all income types
  const { 
    data: incomeTypes = [], 
    isLoading: isLoadingTypes,
    error: typesError 
  } = useQuery({
    queryKey: ["income-types"],
    queryFn: async () => {
      console.log("Fetching income types...");
      const { data, error } = await supabase
        .from("income_types")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching income types:", error);
        throw error;
      }
      return (data as IncomeType[]) || [];
    },
  });

  // Fetch income type settings for a specific source
  const { 
    data: incomeTypeSettings = [], 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: ["income-type-settings", sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      
      console.log("Fetching income type settings for source:", sourceId);
      const { data, error } = await supabase
        .from("income_type_settings")
        .select("*")
        .eq("source_id", sourceId);

      if (error) {
        console.error("Error fetching income type settings:", error);
        throw error;
      }
      return (data as IncomeTypeSettings[]) || [];
    },
    enabled: !!sourceId,
  });

  // Fetch subcategories for all income types
  const { 
    data: subcategories = [], 
    isLoading: isLoadingSubcategories,
    error: subcategoriesError 
  } = useQuery({
    queryKey: ["income-subcategories"],
    queryFn: async () => {
      console.log("Fetching subcategories...");
      const { data, error } = await supabase
        .from("income_subcategories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
      return (data as IncomeSubcategory[]) || [];
    },
  });

  // Toggle income type setting for a source
  const toggleIncomeType = async (incomeTypeId: string, enabled: boolean) => {
    if (!sourceId) return;

    try {
      // First check if a setting already exists
      const { data: existingSettings } = await supabase
        .from("income_type_settings")
        .select("*")
        .eq("source_id", sourceId)
        .eq("income_type_id", incomeTypeId)
        .single();

      if (existingSettings) {
        // Update existing setting
        const { error } = await supabase
          .from("income_type_settings")
          .update({ is_enabled: enabled })
          .eq("source_id", sourceId)
          .eq("income_type_id", incomeTypeId);

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from("income_type_settings")
          .insert({
            source_id: sourceId,
            income_type_id: incomeTypeId,
            is_enabled: enabled,
          });

        if (error) throw error;
      }

      // Invalidate the settings query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ["income-type-settings", sourceId] 
      });

      toast({
        title: "Success",
        description: `Income type ${enabled ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling income type:", error);
      toast({
        title: "Error",
        description: "Failed to update income type setting",
        variant: "destructive",
      });
    }
  };

  // Get subcategories for a specific income type
  const getSubcategories = (incomeTypeId: string) => {
    return subcategories.filter((sub) => sub.income_type_id === incomeTypeId);
  };

  // Check if an income type is enabled for a source
  const isIncomeTypeEnabled = (incomeTypeId: string) => {
    if (!sourceId) return true;
    const setting = incomeTypeSettings.find(
      (s) => s.income_type_id === incomeTypeId
    );
    return setting ? setting.is_enabled : true; // Default to enabled if no setting exists
  };

  return {
    incomeTypes,
    isLoadingTypes,
    typesError,
    isLoadingSettings,
    settingsError,
    isLoadingSubcategories,
    subcategoriesError,
    isIncomeTypeEnabled,
    toggleIncomeType,
    getSubcategories,
  };
};