import { useState, useEffect, useRef } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PayerCreditSettings } from "@/components/payers/PayerCreditSettings";

interface PayerSelectorProps {
  selectedPayerId?: string;
  onSelect: (payerId: string) => void;
  sourceId?: string;
}

export const PayerSelector = ({ selectedPayerId, onSelect, sourceId }: PayerSelectorProps) => {
  const session = useSession();
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  const { data: selectedPayer } = useQuery({
    queryKey: ['payer', selectedPayerId],
    enabled: !!selectedPayerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payers')
        .select('*')
        .eq('id', selectedPayerId)
        .single();
      
      if (error) throw error;
      return data;
    }
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
      onSelect(data.id);
      setSearch(data.name);
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
    payer.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePayerSelect = (payer: typeof payers[0]) => {
    onSelect(payer.id);
    setSearch(payer.name);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onSelect("");
    setSearch("");
    setShowResults(false);
  };

  const handleAddPayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayerName.trim()) {
      addPayer.mutate(newPayerName.trim());
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          {selectedPayerId ? (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <span className="flex-1">{selectedPayer?.name}</span>
              {sourceId && (
                <PayerCreditSettings
                  payerId={selectedPayerId}
                  sourceId={sourceId}
                  payerName={selectedPayer?.name || ""}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search payers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="pl-9"
              />
            </>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
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

      {showResults && search && filteredPayers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredPayers.map(payer => (
            <button
              key={payer.id}
              onClick={() => handlePayerSelect(payer)}
              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
            >
              <div className="font-medium">{payer.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};