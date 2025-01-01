import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PayerSearchInput } from "./PayerSearchInput";
import { PayerList } from "./PayerList";
import { AddPayerDialog } from "./AddPayerDialog";
import { Payer } from "@/types/payer";

interface PayerSelectorProps {
  selectedPayerId?: string;
  onSelect: (payerId: string) => void;
}

export const PayerSelector = ({ selectedPayerId, onSelect }: PayerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
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
      return data as Payer[];
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
      return data as Payer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      setIsDialogOpen(false);
      onSelect(data.id);
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

  const handlePayerSelect = (payer: Payer) => {
    onSelect(payer.id);
    setSearchQuery(payer.name);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <PayerSearchInput
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AddPayerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAdd={(name) => addPayer.mutate(name)}
        />
      </div>

      {searchQuery && <PayerList
        payers={filteredPayers}
        selectedPayerId={selectedPayerId}
        onSelect={handlePayerSelect}
      />}
    </div>
  );
};