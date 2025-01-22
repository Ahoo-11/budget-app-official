import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayerSelectorProps {
  selectedPayerId: string | null;
  onPayerSelect: (payerId: string | null) => void;
}

export const PayerSelector = ({
  selectedPayerId,
  onPayerSelect,
}: PayerSelectorProps) => {
  const { data: payers = [] } = useQuery({
    queryKey: ["payers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Payer</label>
      <Select
        value={selectedPayerId === null ? "_none" : selectedPayerId}
        onValueChange={(value) => onPayerSelect(value === "_none" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a payer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">None</SelectItem>
          {payers.map((payer) => (
            <SelectItem key={payer.id} value={payer.id}>
              {payer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
