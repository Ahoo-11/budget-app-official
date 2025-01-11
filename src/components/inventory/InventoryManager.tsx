import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InventoryForm } from "./InventoryForm";
import { InventorySheet } from "./InventorySheet";
import { Product } from "@/types/product";

interface InventoryManagerProps {
  sourceId: string;
}

export const InventoryManager = ({ sourceId }: InventoryManagerProps) => {
  const [isAddingItem, setIsAddingItem] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .eq('category', 'inventory')
        .order('name');
      
      if (error) throw error;
      return (data as Product[]).map(item => ({
        ...item,
        product_type: item.product_type as 'basic' | 'composite'
      }));
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Inventory Items</h2>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryForm
              sourceId={sourceId}
              onSuccess={() => setIsAddingItem(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <InventorySheet items={inventory} sourceId={sourceId} />
    </div>
  );
};