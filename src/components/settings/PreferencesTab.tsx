
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayNameManager } from "./DisplayNameManager";

export function PreferencesTab() {
  const { data: userInfo } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get role info
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Get profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      return {
        email: user.email,
        role: roleData?.role,
        status: profile?.status
      };
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
          </div>
          
          <DisplayNameManager />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <p className="text-sm text-muted-foreground capitalize">
              {userInfo?.role || 'No role assigned'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Status</label>
            <p className="text-sm text-muted-foreground capitalize">
              {userInfo?.status || 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
