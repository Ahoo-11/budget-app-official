import { HotTable } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';
import { Product } from "@/types/product";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import "handsontable/dist/handsontable.full.min.css";
import type { CellChange } from 'handsontable/common';

registerAllModules();

interface InventorySheetProps {
  items: Product[];
  sourceId: string;
}

export const InventorySheet = ({ items, sourceId }: InventorySheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProduct = useMutation({
    mutationFn: async (changes: CellChange[]) => {
      const [row, prop, , newValue] = changes[0];
      const product = items[row as number];
      const propertyName = prop as keyof Product;
      
      const { error } = await supabase
        .from('products')
        .update({ [propertyName]: newValue })
        .eq('id', product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', sourceId] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  });

  const columns = [
    { data: 'name', title: 'Name', width: 200 },
    { data: 'description', title: 'Description', width: 200 },
    { data: 'subcategory', title: 'Category', width: 120 },
    { data: 'storage_location', title: 'Location', width: 120 },
    { 
      data: 'purchase_cost', 
      title: 'Purchase Cost (MVR)', 
      type: 'numeric',
      numericFormat: {
        pattern: '0,0.00',
        culture: 'en-US'
      },
      width: 120 
    },
    { 
      data: 'current_stock', 
      title: 'Current Stock',
      type: 'numeric',
      width: 100 
    },
    { 
      data: 'minimum_stock_level', 
      title: 'Min Stock',
      type: 'numeric',
      width: 100 
    }
  ];

  return (
    <div className="w-full overflow-x-auto">
      <HotTable
        data={items}
        columns={columns}
        rowHeaders={true}
        colHeaders={true}
        height="auto"
        licenseKey="non-commercial-and-evaluation"
        afterChange={(changes) => {
          if (changes) {
            updateProduct.mutate(changes as CellChange[]);
          }
        }}
        stretchH="all"
        className="htCenter"
      />
    </div>
  );
};