import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";

export function EmploymentIncome({ sourceId }: { sourceId: string }) {
  const { types, isTypeEnabled } = useTypes(sourceId);

  const { data: entries = [] } = useQuery({
    queryKey: ["employment-entries", sourceId],
    queryFn: async () => {
      const employmentType = types.find(t => t.name === "Employment Income");
      if (!employmentType || !isTypeEnabled(employmentType.id)) return [];

      const { data, error } = await supabase
        .from("income_entries")
        .select(`
          *,
          type_subcategories (
            name
          )
        `)
        .eq("source_id", sourceId)
        .eq("type_id", employmentType.id);

      if (error) throw error;
      return data;
    },
    enabled: types.length > 0,
  });

  return (
    <div>
      <h2>Employment Income Entries</h2>
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
