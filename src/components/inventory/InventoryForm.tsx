import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface InventoryFormProps {
  sourceId: string;
  onSuccess?: () => void;
}

export const InventoryForm = ({ sourceId, onSuccess }: InventoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addInventoryItem = useMutation({
    mutationFn: async (formData: FormData) => {
      const itemData = {
        source_id: sourceId,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: 'inventory',
        subcategory: formData.get('subcategory') as string,
        storage_location: formData.get('location') as string,
        purchase_cost: parseFloat(formData.get('purchase_cost') as string),
        current_stock: 1,
        price: 0, // Required field but not relevant for inventory items
      };

      const { data, error } = await supabase
        .from('products')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addInventoryItem.mutateAsync(new FormData(e.currentTarget));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          name="name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="subcategory">Category</Label>
        <Input
          id="subcategory"
          name="subcategory"
          placeholder="e.g., Equipment, Furniture, Kitchen Supplies"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., Kitchen, Storage Room, Office"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="purchase_cost">Purchase Cost</Label>
        <Input
          id="purchase_cost"
          name="purchase_cost"
          type="number"
          step="0.01"
          min="0"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add details about the item, including warranty information or maintenance notes"
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Item...
          </>
        ) : (
          "Add Item"
        )}
      </Button>
    </form>
  );
};