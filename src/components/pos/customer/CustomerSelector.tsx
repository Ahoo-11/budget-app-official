import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PayerCreditSettings } from "@/components/payers/PayerCreditSettings";

interface Payer {
  id: string;
  name: string;
  contact_info?: any;
}

interface PayerSelectorProps {
  selectedPayerId?: string;
  onSelect: (payerId: string) => void;
  sourceId?: string;
}

export const CustomerSelector = ({ selectedPayerId, onSelect, sourceId }: PayerSelectorProps) => {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: payers = [] } = useQuery({
    queryKey: ['payers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Payer[];
    }
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
      return data as Payer;
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

  const handlePayerSelect = (payer: Payer) => {
    onSelect(payer.id);
    setSearch("");
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onSelect("");
    setSearch("");
    setShowResults(false);
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
              {payer.contact_info && (
                <div className="text-sm text-muted-foreground">
                  {payer.contact_info.phone || payer.contact_info.email}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};