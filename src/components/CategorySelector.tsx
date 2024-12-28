import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const renderOptions = (parentId: string | null = null, level: number = 0) => {
    const subcategories = categories.filter(cat => cat.parent_id === parentId);
    
    return subcategories.map(category => (
      <>
        <option key={category.id} value={category.id}>
          {"  ".repeat(level) + category.name}
        </option>
        {renderOptions(category.id, level + 1)}
      </>
    ));
  };

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
        {renderOptions()}
      </select>
    </div>
  );
};