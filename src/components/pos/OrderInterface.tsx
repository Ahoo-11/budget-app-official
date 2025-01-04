import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";

export function OrderInterface({ sourceId }: { sourceId: string }) {
  const { types, isTypeEnabled } = useTypes(sourceId);

  const { data: typeSettings = [] } = useQuery({
    queryKey: ["type-settings", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("type_settings")
        .select("*")
        .eq("source_id", sourceId);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h2 className="text-lg font-bold">Order Interface</h2>
      <div>
        {types.map((type) => (
          isTypeEnabled(type.id) && (
            <div key={type.id} className="type-item">
              <h3>{type.name}</h3>
              <p>{type.description}</p>
            </div>
          )
        ))}
      </div>
      <div>
        <h3>Type Settings</h3>
        <ul>
          {typeSettings.map((setting) => (
            <li key={setting.id}>
              Type ID: {setting.type_id}, Enabled: {setting.is_enabled ? 'Yes' : 'No'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
