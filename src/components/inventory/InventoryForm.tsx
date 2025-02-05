import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/database-types";

type Product = Database["budget"]["Tables"]["products"]["Row"];
type InsertProduct = Database["budget"]["Tables"]["products"]["Insert"];

interface InventoryFormProps {
  sourceId: string;
  onSuccess?: () => void;
}

interface InventoryFormData {
  name: string;
  description: string;
  subcategory: string;
  location: string;
  purchase_cost: number;
}

export const InventoryForm = ({ sourceId, onSuccess }: InventoryFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addInventoryItem = useMutation({
    mutationFn: async (formData: FormData): Promise<Product> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const form: InventoryFormData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        subcategory: formData.get('subcategory') as string,
        location: formData.get('location') as string,
        purchase_cost: parseFloat(formData.get('purchase_cost') as string),
      };

      // Validate form data
      if (!form.name.trim()) throw new Error("Item name is required");
      if (isNaN(form.purchase_cost) || form.purchase_cost < 0) {
        throw new Error("Purchase cost must be a valid positive number");
      }

      const itemData: InsertProduct = {
        source_id: sourceId,
        name: form.name.trim(),
        description: form.description?.trim(),
        category: 'inventory',
        subcategory: form.subcategory?.trim(),
        storage_location: form.location?.trim(),
        last_purchase_price: form.purchase_cost,
        last_purchase_date: new Date().toISOString(),
        current_stock: 1,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('products')
        .insert(itemData)
        .select()
        .single();

      if (error) {
        console.error('Error adding inventory item:', error);
        throw new Error(error.message);
      }

      if (!data) throw new Error("Failed to create inventory item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add inventory item",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addInventoryItem.mutateAsync(new FormData(e.currentTarget));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          name="name"
          required
          disabled={addInventoryItem.isPending}
          placeholder="Enter item name"
        />
      </div>

      <div>
        <Label htmlFor="subcategory">Category</Label>
        <Input
          id="subcategory"
          name="subcategory"
          placeholder="e.g., Equipment, Furniture, Kitchen Supplies"
          disabled={addInventoryItem.isPending}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., Kitchen, Storage Room, Office"
          disabled={addInventoryItem.isPending}
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
          disabled={addInventoryItem.isPending}
          placeholder="0.00"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add details about the item, including warranty information or maintenance notes"
          disabled={addInventoryItem.isPending}
        />
      </div>

      <Button type="submit" disabled={addInventoryItem.isPending} className="w-full">
        {addInventoryItem.isPending ? (
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