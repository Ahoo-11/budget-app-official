import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./settings/ThemeSelector";
import { CategoryManager } from "./settings/CategoryManager";
import { PayerManager } from "./settings/PayerManager";
import { UserManagement } from "./settings/UserManagement";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DisplayNameManager } from "./settings/DisplayNameManager";
import { Alert, AlertDescription } from "./ui/alert";

export function AccountSettings() {
  const navigate = useNavigate();

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role;
    },
    staleTime: 0
  });

  const { data: userStatus } = useQuery({
    queryKey: ['userStatus'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.status;
    },
    staleTime: 0
  });

  const { data: hasSourceAccess } = useQuery({
    queryKey: ['hasSourceAccess'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      if (userStatus !== 'approved') {
        return false;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleData?.role === 'controller' || roleData?.role === 'super_admin') {
        return true;
      }

      const { data: permissions, error } = await supabase
        .from('source_permissions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;
      return permissions && permissions.length > 0;
    },
    enabled: !!userStatus && userStatus === 'approved',
    staleTime: 0
  });

  const canManageUsers = userRole === 'controller' || userRole === 'super_admin';
  const showNoAccessMessage = userStatus === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {showNoAccessMessage ? (
        <Alert>
          <AlertDescription>
            Your account is pending approval. A controller or administrator needs to grant you access to start using the application.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <DisplayNameManager />
          <ThemeSelector />
          {hasSourceAccess && (
            <>
              <CategoryManager />
              <PayerManager />
            </>
          )}
          {canManageUsers && <UserManagement />}
        </div>
      )}
    </div>
  );
}