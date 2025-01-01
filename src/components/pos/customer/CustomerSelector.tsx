import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CustomerCreditSettings } from "@/components/customers/CustomerCreditSettings";

interface Customer {
  id: string;
  name: string;
  contact_info?: any;
}

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onSelect: (customerId: string) => void;
  sourceId?: string;
}

export const CustomerSelector = ({ selectedCustomerId, onSelect, sourceId }: CustomerSelectorProps) => {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    }
  });

  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedCustomerId)
        .single();
      
      if (error) throw error;
      return data as Customer;
    }
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase())
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

  const handleCustomerSelect = (customer: Customer) => {
    onSelect(customer.id);
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
          {selectedCustomerId ? (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <span className="flex-1">{selectedCustomer?.name}</span>
              {sourceId && (
                <CustomerCreditSettings
                  customerId={selectedCustomerId}
                  sourceId={sourceId}
                  customerName={selectedCustomer?.name || ""}
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
                placeholder="Search customers..."
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

      {showResults && search && filteredCustomers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCustomers.map(customer => (
            <button
              key={customer.id}
              onClick={() => handleCustomerSelect(customer)}
              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
            >
              <div className="font-medium">{customer.name}</div>
              {customer.contact_info && (
                <div className="text-sm text-muted-foreground">
                  {customer.contact_info.phone || customer.contact_info.email}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
