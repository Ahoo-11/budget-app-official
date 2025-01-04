import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Type, TypeSettings, TypeSubcategory } from "@/types/types";
import { useToast } from "./use-toast";

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
      console.log("Fetching types...");
      const { data, error } = await supabase
        .from("types")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching types:", error);
        throw error;
      }
      return (data as Type[]) || [];
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
      
      console.log("Fetching type settings for source:", sourceId);
      const { data, error } = await supabase
        .from("type_settings")
        .select("*")
        .eq("source_id", sourceId);

      if (error) {
        console.error("Error fetching type settings:", error);
        throw error;
      }
      return (data as TypeSettings[]) || [];
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
      console.log("Fetching subcategories...");
      const { data, error } = await supabase
        .from("type_subcategories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
      return (data as TypeSubcategory[]) || [];
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
  };
};