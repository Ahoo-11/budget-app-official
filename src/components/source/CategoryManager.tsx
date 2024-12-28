import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  source_id: string;
  parent_id: string | null;
}

interface CategoryManagerProps {
  sourceId: string;
}

export const CategoryManager = ({ sourceId }: CategoryManagerProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; parent_id: string | null }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          source_id: sourceId,
          parent_id: categoryData.parent_id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', sourceId] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      setSelectedParentId(null);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    addCategoryMutation.mutate({
      name: newCategoryName.trim(),
      parent_id: selectedParentId
    });
  };

  const getSubcategories = (parentId: string | null): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const renderCategoryTree = (parentId: string | null = null, level: number = 0) => {
    const subcategories = getSubcategories(parentId);
    
    return subcategories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }} className="my-2">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4" />
          <span>{category.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedParentId(category.id);
              setIsAddingCategory(true);
            }}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>
        {renderCategoryTree(category.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categories</h3>
        <Button onClick={() => {
          setSelectedParentId(null);
          setIsAddingCategory(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="mt-4">
        {renderCategoryTree()}
      </div>

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedParentId 
                ? "Add Subcategory" 
                : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
            >
              {addCategoryMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};