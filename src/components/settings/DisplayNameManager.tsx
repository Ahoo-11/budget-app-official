import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, Check, X } from "lucide-react";

export function DisplayNameManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budgetapp_profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();  // Changed from single() to maybeSingle()

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    }
  });

  const updateDisplayName = useMutation({
    mutationFn: async (newName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('budgetapp_profiles')
        .update({ 
          display_name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Display name updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating display name:", error);
      toast({
        title: "Error",
        description: "Failed to update display name. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setNewDisplayName(profile?.display_name || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (newDisplayName.trim()) {
      updateDisplayName.mutate(newDisplayName.trim());
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewDisplayName("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading profile. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <h3 className="text-lg font-medium">Display Name</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isEditing ? (
          <>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter display name"
              className="max-w-xs"
            />
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleSave}
                disabled={updateDisplayName.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCancel}
                disabled={updateDisplayName.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">
              {profile?.display_name || "No display name set"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
