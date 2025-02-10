import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "./ui/use-toast";
import { Database } from "@/types/database.types";

type Tables = Database['public']['Tables'];
type Category = Tables['budgetapp_categories']['Row'];

interface CategorySelectorProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  sourceId: string;
}

export function CategorySelector({ value, onValueChange, sourceId }: CategorySelectorProps) {
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', sourceId],
    queryFn: async () => {
      const { data: categoriesData, error } = await supabase
        .from('budgetapp_categories')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again.",
        });
        return [];
      }

      return categoriesData || [];
    },
    enabled: !!sourceId
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
