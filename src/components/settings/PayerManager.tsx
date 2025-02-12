import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

export function PayerManager() {
  const [newPayer, setNewPayer] = useState("");
  const [editingPayer, setEditingPayer] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();
  const session = useSession();

  const { data: payers = [] } = useQuery({
    queryKey: ['payers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgetapp_payers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const addPayer = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from('budgetapp_payers')
        .insert([{ name, user_id: session.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      setNewPayer("");
      toast.success("Payer added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add payer: " + error.message);
    }
  });

  const updatePayer = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('budgetapp_payers')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      setEditingPayer(null);
      toast.success("Payer updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update payer: " + error.message);
    }
  });

  const deletePayer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgetapp_payers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      toast.success("Payer deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete payer: " + error.message);
    }
  });

  const handleAddPayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayer.trim()) {
      addPayer.mutate(newPayer.trim());
    }
  };

  const handleUpdatePayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayer && editingPayer.name.trim()) {
      updatePayer.mutate(editingPayer);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Payers</h4>
      <form onSubmit={handleAddPayer} className="flex gap-2">
        <Input
          placeholder="New payer name"
          value={newPayer}
          onChange={(e) => setNewPayer(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {payers.map((payer) => (
          <div key={payer.id} className="flex items-center gap-2">
            {editingPayer?.id === payer.id ? (
              <form onSubmit={handleUpdatePayer} className="flex-1 flex gap-2">
                <Input
                  value={editingPayer.name}
                  onChange={(e) => setEditingPayer({ ...editingPayer, name: e.target.value })}
                  autoFocus
                />
                <Button type="submit" size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline"
                  onClick={() => setEditingPayer(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <>
                <span className="flex-1">{payer.name}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditingPayer(payer)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => deletePayer.mutate(payer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}