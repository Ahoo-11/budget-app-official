import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";

export function GiftsIncome({ sourceId }: { sourceId: string }) {
  const { types, isTypeEnabled } = useTypes(sourceId);

  const { data: entries = [] } = useQuery({
    queryKey: ["gifts-entries", sourceId],
    queryFn: async () => {
      const giftsType = types.find(t => t.name === "Gifts and Grants");
      if (!giftsType || !isTypeEnabled(giftsType.id)) return [];

      const { data, error } = await supabase
        .from("income_entries")
        .select(`
          *,
          type_subcategories (
            name
          )
        `)
        .eq("source_id", sourceId)
        .eq("type_id", giftsType.id);

      if (error) throw error;
      return data;
    },
    enabled: types.length > 0,
  });

  return (
    <div>
      <h2>Gifts and Grants Income</h2>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {entry.amount} - {entry.type_subcategories?.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
