import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupplierSelectorProps {
  sourceId: string;
  supplierId: string;
  onSupplierChange: (id: string) => void;
}

export const SupplierSelector = ({
  sourceId,
  supplierId,
  onSupplierChange,
}: SupplierSelectorProps) => {
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div>
      <Label>Supplier</Label>
      <Select value={supplierId} onValueChange={onSupplierChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select supplier" />
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
  );
};