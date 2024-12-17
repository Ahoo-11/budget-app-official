import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CategoryManager() {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategory("");
      toast.success("Category added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add category: " + error.message);
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    }
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory.mutate(newCategory.trim());
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory.mutate(editingCategory);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Categories</h4>
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            {editingCategory?.id === category.id ? (
              <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-2">
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  autoFocus
                />
                <Button type="submit" size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <>
                <span className="flex-1">{category.name}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditingCategory(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => deleteCategory.mutate(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}