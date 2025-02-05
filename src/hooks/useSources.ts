import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Source } from "@/types/source";
import { useToast } from "@/hooks/use-toast";

export function useSources(userStatus: string | null) {
  const session = useSession();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['sources', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || userStatus !== 'approved') return [];
      
      try {
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .schema('budget')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          throw roleError;
        }

        let query = supabase
          .from('sources')
          .schema('budget')
          .select('*');

        // Only fetch sources the user has permission to access
        if (!userRole || !['controller', 'super_admin'].includes(userRole.role)) {
          const { data: permissions, error: permError } = await supabase
            .from('source_permissions')
            .schema('budget')
            .select('source_id')
            .eq('user_id', session.user.id);

          if (permError) {
            console.error('Error fetching permissions:', permError);
            throw permError;
          }

          if (permissions && permissions.length > 0) {
            const sourceIds = permissions.map(p => p.source_id);
            query = query.in('id', sourceIds);
          } else {
            return [];
          }
        }

        const { data, error } = await query.order('created_at');
        
        if (error) {
          console.error('Error fetching sources:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch sources. Please try refreshing the page.",
          });
          throw error;
        }
        return data as Source[];
      } catch (error) {
        console.error('Error in sources query:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching sources. Please try again.",
        });
        throw error;
      }
    },
    enabled: !!session?.user?.id && userStatus === 'approved',
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 5 // Keep unused data in cache for 5 minutes
  });
}