import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database-types";

type Category = Database["budget_app"]["Tables"]["categories"]["Row"];

interface CategorySelectorProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sourceId: string;
}

export const CategorySelector = ({ 
  selectedCategory, 
  setSelectedCategory,
  sourceId 
}: CategorySelectorProps) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, created_at')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return (data || []) as Category[];
    },
    enabled: !!sourceId
  });

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          disabled
          className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20 bg-gray-100"
        >
          <option>Loading categories...</option>
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};