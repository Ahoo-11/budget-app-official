import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  source_id: string;
  parent_id: string | null;
}

interface ProductCategoriesProps {
  defaultValues?: {
    category?: string;
    subcategory?: string;
  };
  isSubmitting: boolean;
  sourceId: string;
  onChange?: (values: { category?: string; subcategory?: string }) => void;
}

export const ProductCategories = ({ defaultValues, isSubmitting, sourceId, onChange }: ProductCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(defaultValues?.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(defaultValues?.subcategory);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Get root categories (no parent_id)
  const rootCategories = categories.filter(cat => !cat.parent_id);

  // Get subcategories for a given parent category
  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  // Get subcategories for currently selected category
  const availableSubcategories = selectedCategory
    ? getSubcategories(categories.find(c => c.name === selectedCategory)?.id || '')
    : [];

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory(undefined);
    onChange?.({ category: value, subcategory: undefined });
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    onChange?.({ category: selectedCategory, subcategory: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Select
          name="category"
          defaultValue={defaultValues?.category}
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {rootCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          name="subcategory"
          value={selectedSubcategory}
          onValueChange={handleSubcategoryChange}
          disabled={isSubmitting || !selectedCategory || availableSubcategories.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedCategory 
                ? "Select a category first" 
                : availableSubcategories.length === 0 
                  ? "No subcategories available" 
                  : "Select a subcategory"
            } />
          </SelectTrigger>
          <SelectContent>
            {availableSubcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.name}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};