import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

interface PayerSelectorProps {
  selectedPayer: string;
  setSelectedPayer: (payer: string) => void;
}

export const PayerSelector = ({ selectedPayer, setSelectedPayer }: PayerSelectorProps) => {
  const session = useSession();
  const [isAddPayerOpen, setIsAddPayerOpen] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: payers = [], refetch: refetchPayers } = useQuery({
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

  const handleAddPayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('payers')
        .insert([{ name: newPayerName, user_id: session.user.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payer added successfully",
      });

      setNewPayerName("");
      setIsAddPayerOpen(false);
      refetchPayers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payer",
        variant: "destructive"
      });
    }
  };

  const filteredPayers = payers.filter(payer => 
    payer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAddPayerOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <select
        value={selectedPayer}
        onChange={(e) => setSelectedPayer(e.target.value)}
        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
        required
      >
        <option value="">Select a payer</option>
        {filteredPayers.map((payer) => (
          <option key={payer.id} value={payer.id}>
            {payer.name}
          </option>
        ))}
      </select>

      <Dialog open={isAddPayerOpen} onOpenChange={setIsAddPayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Payer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayer} className="space-y-4">
            <Input
              type="text"
              value={newPayerName}
              onChange={(e) => setNewPayerName(e.target.value)}
              placeholder="Enter payer name"
              required
            />
            <Button type="submit">Add Payer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};