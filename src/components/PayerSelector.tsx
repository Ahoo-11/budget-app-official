import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PayerSelectorProps {
  selectedPayer: string;
  setSelectedPayer: (payer: string) => void;
}

export const PayerSelector = ({ selectedPayer, setSelectedPayer }: PayerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const filteredPayers = payers.filter(payer => 
    payer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPayerName = payers.find(p => p.id === selectedPayer)?.name || '';

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
          onClick={() => navigate('/settings')}
        >
          <Plus className="h-4 w-4" />
        </Button>
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
          No payers found. Click the + button to add a new payer in settings.
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