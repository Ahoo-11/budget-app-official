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
  supplierId: string;
  onSupplierChange: (id: string) => void;
}

export const SupplierSelector = ({
  supplierId,
  onSupplierChange,
}: SupplierSelectorProps) => {
  const { data: suppliers = [], isError } = useQuery({
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

  if (isError) {
    return <div>Error loading suppliers</div>;
  }

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