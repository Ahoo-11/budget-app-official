import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "@/types/database.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tables = Database['public']['Tables']
type Source = Tables['budgetapp_sources']['Row'];
type UserRole = Tables['budgetapp_user_roles']['Row'];
type Payer = Tables['budgetapp_payers']['Row'];

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

  // Get user's role first
  const { data: userRoleData } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('budgetapp_user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data;
    },
  });

  // Fetch payers based on user's role and access
  const { data: payers = [] } = useQuery<Payer[]>({
    queryKey: ['payers', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from('budgetapp_payers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching payers:', error);
        return [];
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Add new payer mutation
  const addPayerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgetapp_payers')
        .insert([
          {
            name,
            created_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      setIsDialogOpen(false);
      setNewPayerName('');
      toast({
        title: "Success",
        description: "New payer added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add new payer",
        variant: "destructive",
      });
    },
  });

  const filteredPayers = payers.filter((payer) =>
    payer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPayer = () => {
    if (!newPayerName.trim()) {
      toast({
        title: "Error",
        description: "Payer name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    addPayerMutation.mutate(newPayerName.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={selectedPayer} onValueChange={setSelectedPayer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a payer" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <Input
                placeholder="Search payers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredPayers.map((payer) => (
              <SelectItem key={payer.id} value={payer.id}>
                {payer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {userRoleData?.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Payer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter payer name"
                  value={newPayerName}
                  onChange={(e) => setNewPayerName(e.target.value)}
                />
                <Button
                  onClick={handleAddPayer}
                  disabled={addPayerMutation.isPending}
                >
                  {addPayerMutation.isPending ? "Adding..." : "Add Payer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
