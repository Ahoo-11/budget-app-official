import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Type, TypeSettings, TypeSubcategory } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";

export const useTypes = (sourceId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all types
  const { 
    data: types = [], 
    isLoading: isLoadingTypes,
    error: typesError 
  } = useQuery({
    queryKey: ["types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Type[];
    },
  });

  // Fetch type settings for a specific source
  const { 
    data: typeSettings = [], 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: ["type-settings", sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      
      const { data, error } = await supabase
        .from("type_settings")
        .select("*")
        .eq("source_id", sourceId);

      if (error) throw error;
      return data as TypeSettings[];
    },
    enabled: !!sourceId,
  });

  // Fetch subcategories for all types
  const { 
    data: subcategories = [], 
    isLoading: isLoadingSubcategories,
    error: subcategoriesError 
  } = useQuery({
    queryKey: ["type-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("type_subcategories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as TypeSubcategory[];
    },
  });

  // Get subcategories for a specific type
  const getSubcategories = (typeId: string) => {
    return subcategories.filter((sub) => sub.type_id === typeId);
  };

  // Check if a type is enabled for a source
  const isTypeEnabled = (typeId: string) => {
    if (!sourceId) return true;
    const setting = typeSettings.find(
      (s) => s.type_id === typeId
    );
    return setting ? setting.is_enabled : true;
  };

  // Toggle type enabled/disabled status
  const toggleType = async (typeId: string, isEnabled: boolean) => {
    if (!sourceId) return;

    try {
      // First, check if a setting already exists
      const { data: existingSettings, error: checkError } = await supabase
        .from("type_settings")
        .select("*")
        .eq("source_id", sourceId)
        .eq("type_id", typeId);

      if (checkError) throw checkError;

      if (existingSettings && existingSettings.length > 0) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from("type_settings")
          .update({ is_enabled: isEnabled })
          .eq("source_id", sourceId)
          .eq("type_id", typeId);

        if (updateError) throw updateError;
      } else {
        // Insert new setting
        const { error: insertError } = await supabase
          .from("type_settings")
          .insert({
            source_id: sourceId,
            type_id: typeId,
            is_enabled: isEnabled,
          });

        if (insertError) throw insertError;
      }

      await queryClient.invalidateQueries({ queryKey: ["type-settings", sourceId] });

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
    isLoadingSubcategories,
    subcategoriesError,
    isTypeEnabled,
    getSubcategories,
    toggleType,
    // Backward compatibility
    incomeTypes: types,
    isIncomeTypeEnabled: isTypeEnabled,
  };
};

// Re-export for backward compatibility
export const useIncomeTypes = useTypes;