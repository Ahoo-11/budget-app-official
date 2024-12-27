import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/types/source";

interface SourceSelectorProps {
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  source_id?: string;
}

export const SourceSelector = ({ selectedSource, setSelectedSource, source_id }: SourceSelectorProps) => {
  const session = useSession();

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First check user's role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // If controller, return all sources
      if (userRole?.role === 'controller') {
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data;
      }

      // For other roles, check permissions
      const { data: permissions } = await supabase
        .from('source_permissions')
        .select('source_id')
        .eq('user_id', user.id);

      if (permissions && permissions.length > 0) {
        const sourceIds = permissions.map(p => p.source_id);
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .in('id', sourceIds)
          .order('name');
        
        if (error) throw error;
        return data;
      }

      return [];
    },
    enabled: !!session?.user?.id
  });

  if (source_id) return null;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Source</label>
      <select
        value={selectedSource}
        onChange={(e) => setSelectedSource(e.target.value)}
        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
        required
      >
        <option value="">Select a source</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
    </div>
  );
};