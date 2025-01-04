import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function OrderInterface({ sourceId }: { sourceId: string }) {
  const { types, isTypeEnabled, toggleType } = useTypes(sourceId);

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Income Types</h2>
      <div className="grid gap-4">
        {types.map((type) => (
          <Card key={type.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{type.name}</h3>
                {type.description && (
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`type-${type.id}`}
                  checked={isTypeEnabled(type.id)}
                  onCheckedChange={(checked) => toggleType(type.id, checked)}
                />
                <Label htmlFor={`type-${type.id}`}>
                  {isTypeEnabled(type.id) ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}