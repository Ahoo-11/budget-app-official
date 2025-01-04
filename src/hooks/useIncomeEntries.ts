import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IncomeFormData } from "@/types/income";
import { useToast } from "./use-toast";

interface UseIncomeEntriesProps {
  sourceId: string;
}

export const useIncomeEntries = ({ sourceId }: UseIncomeEntriesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch income entries for a source
  const { data: incomeEntries = [] } = useQuery({
    queryKey: ["income-entries", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income_entries")
        .select(`
          *,
          income_type:income_types(name),
          subcategory:income_subcategories(name)
        `)
        .eq("source_id", sourceId)
        .order("date", { ascending: false }) as { data: any[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
    enabled: !!sourceId,
  });

  // Add new income entry
  const addIncome = useMutation({
    mutationFn: async (data: IncomeFormData) => {
      const { photo, ...rest } = data;
      let photoUrl = null;

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const filePath = `${sourceId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("income-photos")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("income-photos")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Insert income entry
      const { error } = await supabase
        .from("income_entries")
        .insert({
          ...rest,
          source_id: sourceId,
          photo_url: photoUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-entries", sourceId] });
      toast({
        title: "Success",
        description: "Income entry added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding income entry:", error);
      toast({
        title: "Error",
        description: "Failed to add income entry",
        variant: "destructive",
      });
    },
  });

  // Update income entry
  const updateIncome = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IncomeFormData> }) => {
      const { photo, ...rest } = data;
      let photoUrl = undefined;

      // Upload new photo if provided
      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const filePath = `${sourceId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("income-photos")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("income-photos")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Update income entry
      const { error } = await supabase
        .from("income_entries")
        .update({
          ...rest,
          photo_url: photoUrl,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-entries", sourceId] });
      toast({
        title: "Success",
        description: "Income entry updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating income entry:", error);
      toast({
        title: "Error",
        description: "Failed to update income entry",
        variant: "destructive",
      });
    },
  });

  // Delete income entry
  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("income_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-entries", sourceId] });
      toast({
        title: "Success",
        description: "Income entry deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting income entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete income entry",
        variant: "destructive",
      });
    },
  });

  return {
    incomeEntries,
    addIncome,
    updateIncome,
    deleteIncome,
  };
};
