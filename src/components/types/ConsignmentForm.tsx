import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ConsignmentFormProps {
  sourceId: string;
  onSuccess?: () => void;
}

export const ConsignmentForm = ({ sourceId, onSuccess }: ConsignmentFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const consignmentData = {
      source_id: sourceId,
      supplier_id: selectedSupplier,
      name: String(formData.get('name')),
      description: formData.get('description') ? String(formData.get('description')) : null,
      unit_cost: parseFloat(formData.get('unit_cost') as string),
      selling_price: parseFloat(formData.get('selling_price') as string),
      current_stock: parseInt(formData.get('current_stock') as string),
      minimum_stock_level: parseInt(formData.get('minimum_stock_level') as string),
      unit_of_measurement: formData.get('unit_of_measurement') ? String(formData.get('unit_of_measurement')) : null,
      storage_location: formData.get('storage_location') ? String(formData.get('storage_location')) : null,
    };

    try {
      const { error } = await supabase
        .from('consignments')
        .insert(consignmentData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Consignment product added successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error adding consignment:', error);
      toast({
        title: "Error",
        description: "Failed to add consignment product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="supplier">Supplier</Label>
        <Select
          value={selectedSupplier}
          onValueChange={setSelectedSupplier}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      <div>
        <Label htmlFor="unit_cost">Unit Cost</Label>
        <Input
          id="unit_cost"
          name="unit_cost"
          type="number"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <Label htmlFor="selling_price">Selling Price</Label>
        <Input
          id="selling_price"
          name="selling_price"
          type="number"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <Label htmlFor="current_stock">Current Stock</Label>
        <Input
          id="current_stock"
          name="current_stock"
          type="number"
          min="0"
          required
        />
      </div>

      <div>
        <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
        <Input
          id="minimum_stock_level"
          name="minimum_stock_level"
          type="number"
          min="0"
          required
        />
      </div>

      <div>
        <Label htmlFor="unit_of_measurement">Unit of Measurement</Label>
        <Input id="unit_of_measurement" name="unit_of_measurement" required />
      </div>

      <div>
        <Label htmlFor="storage_location">Storage Location</Label>
        <Input id="storage_location" name="storage_location" />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Consignment'
        )}
      </Button>
    </form>
  );
};