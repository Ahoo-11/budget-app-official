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

interface CustomerSelectorProps {
  selectedCustomer?: string;
  setSelectedCustomer?: (customer: string) => void;
}

export const CustomerSelector = ({ selectedCustomer, setSelectedCustomer }: CustomerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Search customers..."
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

      {searchQuery && filteredCustomers.length > 0 && (
        <div className="absolute mt-10 w-[calc(100%-220px)] border rounded-md divide-y bg-white shadow-lg z-10">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                setSelectedCustomer?.(customer.id);
                setSearchQuery(customer.name);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                selectedCustomer === customer.id ? 'bg-accent' : ''
              }`}
            >
              {customer.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};