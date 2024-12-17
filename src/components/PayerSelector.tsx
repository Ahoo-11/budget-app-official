import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PayerSelectorProps {
  selectedPayer: string;
  setSelectedPayer: (payer: string) => void;
}

export const PayerSelector = ({ selectedPayer, setSelectedPayer }: PayerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payers = [] } = useQuery({
    queryKey: ['payers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addPayer = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from('payers')
        .insert([{ name, user_id: session.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      setNewPayerName("");
      setIsDialogOpen(false);
      setSelectedPayer(data.id);
      setSearchQuery(data.name);
      toast({
        title: "Success",
        description: "Payer added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add payer: " + error.message,
        variant: "destructive"
      });
    }
  });

  const filteredPayers = payers.filter(payer => 
    payer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPayerName = payers.find(p => p.id === selectedPayer)?.name || '';

  const handleAddPayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayerName.trim()) {
      addPayer.mutate(newPayerName.trim());
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Payer</label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search payers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPayer} className="space-y-4">
              <Input
                placeholder="Payer name"
                value={newPayerName}
                onChange={(e) => setNewPayerName(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Add Payer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {searchQuery && filteredPayers.length > 0 ? (
        <div className="border rounded-md divide-y">
          {filteredPayers.map((payer) => (
            <button
              key={payer.id}
              onClick={() => {
                setSelectedPayer(payer.id);
                setSearchQuery(payer.name);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                selectedPayer === payer.id ? 'bg-accent' : ''
              }`}
            >
              {payer.name}
            </button>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-sm text-muted-foreground">
          No payers found. Click the + button to add a new payer.
        </div>
      ) : null}

      {selectedPayer && !searchQuery && (
        <div className="text-sm">
          Selected: {selectedPayerName}
        </div>
      )}
    </div>
  );
};