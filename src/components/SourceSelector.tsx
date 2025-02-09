
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "./ui/use-toast";

interface SourceSelectorProps {
  selectedSource: string;
  setSelectedSource: (value: string) => void;
  source_id?: string;
}

export function SourceSelector({ selectedSource, setSelectedSource, source_id }: SourceSelectorProps) {
  const { toast } = useToast();

  // Get current user's role
  const { data: currentUserRole } = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roleData, error: roleError } = await supabase
        .from('budgetapp_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      return roleData?.role ?? null;
    }
  });

  // Fetch sources based on user's role and permissions
  const { data: sources = [] } = useQuery({
    queryKey: ['sources', currentUserRole],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // If user is admin or manager, they can see all sources
      if (currentUserRole === 'admin' || currentUserRole === 'manager') {
        const { data: allSources, error: sourcesError } = await supabase
          .from('budgetapp_sources')
          .select('*')
          .order('name');

        if (sourcesError) {
          console.error('Error fetching sources:', sourcesError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load sources. Please try again.",
          });
          return [];
        }

        return allSources || [];
      }

      // For other users, only show sources they have permission for
      const { data: sourcePermissions, error: permError } = await supabase
        .from('budgetapp_source_permissions')
        .select('source_id')
        .eq('user_id', user.id);

      if (permError) {
        console.error('Error fetching permissions:', permError);
        return [];
      }

      if (!sourcePermissions?.length) return [];

      const sourceIds = sourcePermissions.map(p => p.source_id);
      const { data: allowedSources, error: sourcesError } = await supabase
        .from('budgetapp_sources')
        .select('*')
        .in('id', sourceIds)
        .order('name');

      if (sourcesError) {
        console.error('Error fetching sources:', sourcesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sources. Please try again.",
        });
        return [];
      }

      return allowedSources || [];
    },
    enabled: currentUserRole !== undefined
  });

  if (source_id) return null;

  return (
    <Select value={selectedSource} onValueChange={setSelectedSource}>
      <SelectTrigger>
        <SelectValue placeholder="Select source" />
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
  );
}
