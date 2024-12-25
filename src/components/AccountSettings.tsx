import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./settings/ThemeSelector";
import { CategoryManager } from "./settings/CategoryManager";
import { PayerManager } from "./settings/PayerManager";
import { UserManagement } from "./settings/UserManagement";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .single();

      if (error) throw error;
      return data?.role;
    }
  });

  const canManageUsers = userRole === 'controller' || userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-6">
        <ThemeSelector />
        <CategoryManager />
        <PayerManager />
        {canManageUsers && <UserManagement />}
      </div>
    </div>
  );
}