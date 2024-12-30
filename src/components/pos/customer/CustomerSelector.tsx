import { useState, useRef, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomerSelectorProps {
  selectedCustomer?: string;
  setSelectedCustomer?: (customer: string) => void;
}

export const CustomerSelector = ({ 
  selectedCustomer, 
  setSelectedCustomer 
}: CustomerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addCustomer = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{ name, user_id: session.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setNewCustomerName("");
      setIsDialogOpen(false);
      setSelectedCustomer?.(data.id);
      setSearchQuery(data.name);
      setShowResults(false);
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add customer: " + error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomerName = customers.find(c => c.id === selectedCustomer)?.name || '';

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName.trim()) {
      addCustomer.mutate(newCustomerName.trim());
    }
  };

  const handleCustomerSelect = (customerId: string, customerName: string) => {
    setSelectedCustomer?.(customerId);
    setSearchQuery(customerName);
    setShowResults(false);
  };

  const clearSelection = () => {
    setSelectedCustomer?.('');
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pr-8"
          />
          {searchQuery && (
            <button
              onClick={clearSelection}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
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
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <Input
                placeholder="Customer name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Add Customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {showResults && searchQuery && filteredCustomers.length > 0 && (
        <div className="absolute mt-1 w-full border rounded-md bg-white shadow-lg z-50">
          <div className="py-1">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleCustomerSelect(customer.id, customer.name)}
                className={`w-full px-4 py-2 text-left hover:bg-accent ${
                  selectedCustomer === customer.id ? 'bg-accent' : ''
                }`}
              >
                {customer.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCustomer && !showResults && (
        <div className="mt-1 text-sm text-muted-foreground">
          Selected: {selectedCustomerName}
        </div>
      )}
    </div>
  );
};