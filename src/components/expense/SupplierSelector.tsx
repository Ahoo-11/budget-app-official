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
      const userId = supabase.auth.user().id;
      const { data: suppliers } = await supabase
        .from('budgetapp_payers')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (!suppliers) {
        throw new Error('Failed to fetch suppliers');
      }

      return suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      }));
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