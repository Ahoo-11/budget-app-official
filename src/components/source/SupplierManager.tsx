import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  contact_info: any;
  address: string;
  source_id: string;
}

interface SupplierManagerProps {
  sourceId: string;
}

export const SupplierManager = ({ sourceId }: SupplierManagerProps) => {
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_info: "",
    address: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    }
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (supplierData: typeof newSupplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplierData.name,
          contact_info: supplierData.contact_info ? JSON.parse(supplierData.contact_info) : null,
          address: supplierData.address,
          source_id: sourceId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', sourceId] });
      setIsAddingSupplier(false);
      setNewSupplier({ name: "", contact_info: "", address: "" });
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;
    
    addSupplierMutation.mutate(newSupplier);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Suppliers</h3>
        <Button onClick={() => setIsAddingSupplier(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4" />
              <h4 className="font-medium">{supplier.name}</h4>
            </div>
            {supplier.address && (
              <p className="text-sm text-gray-600">{supplier.address}</p>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Supplier name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Textarea
                placeholder="Contact information (JSON format)"
                value={newSupplier.contact_info}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_info: e.target.value }))}
              />
            </div>
            <div>
              <Input
                placeholder="Address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newSupplier.name.trim() || addSupplierMutation.isPending}
            >
              {addSupplierMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};