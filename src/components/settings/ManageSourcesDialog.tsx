import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ManageSourcesDialogProps {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ManageSourcesDialog({ userId, onClose, onUpdate }: ManageSourcesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user's role
  useQuery({
    queryKey: ['userRole', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      setUserRole(data.role);
      return data.role;
    },
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['userSourcePermissions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('source_permissions')
        .select('source_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: userRole !== 'controller', // Don't fetch permissions for controller
  });

  // Update selectedSources when permissions data changes
  useEffect(() => {
    if (userRole === 'controller') {
      // Controller has access to all sources
      setSelectedSources(sources.map(s => s.id));
    } else {
      setSelectedSources(permissions.map(p => p.source_id));
    }
  }, [permissions, userRole, sources]);

  const handleSave = async () => {
    if (userRole === 'controller') {
      toast({
        title: "Info",
        description: "Controller account automatically has access to all sources",
      });
      onClose();
      return;
    }

    setUpdating(true);
    try {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('source_permissions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add new permissions for selected sources
      if (selectedSources.length > 0) {
        const { error: insertError } = await supabase
          .from('source_permissions')
          .insert(
            selectedSources.map(sourceId => ({
              user_id: userId,
              source_id: sourceId,
              can_view: true,
              can_create: userRole === 'admin',
              can_edit: userRole === 'admin',
              can_delete: userRole === 'admin'
            }))
          );

        if (insertError) throw insertError;
      }

      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['sources'] });
      await queryClient.invalidateQueries({ queryKey: ['userSourcePermissions'] });
      await queryClient.invalidateQueries({ queryKey: ['sourcePermissions'] });

      toast({
        title: "Success",
        description: "Source permissions updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update source permissions",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {userRole === 'controller' ? 'Controller Source Access' : 'Manage Source Access'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {userRole === 'controller' ? (
            <div className="text-sm text-gray-500">
              As the controller account, you automatically have access to all sources.
            </div>
          ) : userRole === 'viewer' ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                Select sources this viewer can access (view-only permissions).
              </div>
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(id => id !== source.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={source.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {source.name}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                Select sources this admin can manage.
              </div>
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(id => id !== source.id));
                      }
                    }}
                  />
                  <label
                    htmlFor={source.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {source.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            {userRole !== 'controller' && (
              <Button onClick={handleSave} disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}