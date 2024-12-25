import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
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
  const [updating, setUpdating] = useState(false);

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
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
  });

  const [selectedSources, setSelectedSources] = useState<string[]>(
    permissions.map(p => p.source_id)
  );

  const handleSave = async () => {
    setUpdating(true);
    try {
      // Delete existing permissions
      await supabase
        .from('source_permissions')
        .delete()
        .eq('user_id', userId);

      // Add new permissions
      if (selectedSources.length > 0) {
        const { error } = await supabase
          .from('source_permissions')
          .insert(
            selectedSources.map(sourceId => ({
              user_id: userId,
              source_id: sourceId,
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: false
            }))
          );

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Source permissions updated successfully",
      });
      onUpdate();
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
          <DialogTitle>Manage Source Access</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}