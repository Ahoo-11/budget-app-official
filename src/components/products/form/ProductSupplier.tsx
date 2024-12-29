import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSupplierProps {
  defaultValue?: string;
  isSubmitting: boolean;
}

export const ProductSupplier = ({ defaultValue, isSubmitting }: ProductSupplierProps) => {
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

  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium mb-2">Supplier</label>
      <Select name="supplier_id" defaultValue={defaultValue}>
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