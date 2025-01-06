import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SourceFilterProps {
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
  showSourceSelector?: boolean;
}

export const SourceFilter = ({
  selectedSource,
  setSelectedSource,
  showSourceSelector = false,
}: SourceFilterProps) => {
  const { data: sources = [] } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (!showSourceSelector) return null;

  return (
    <div>
      <Label>Source</Label>
      <Select 
        value={selectedSource || undefined} 
        onValueChange={(value) => setSelectedSource(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};