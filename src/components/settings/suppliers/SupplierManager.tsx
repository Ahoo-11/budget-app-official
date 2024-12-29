import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SupplierForm } from "./SupplierForm";
import { SupplierCard } from "./SupplierCard";

export const SupplierManager = () => {
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const { toast } = useToast();

  const { data: suppliers = [], refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      return data;
    }
  });

  const handleSuccess = () => {
    setIsAddingSupplier(false);
    refetch();
    toast({
      title: "Success",
      description: "Supplier added successfully",
    });
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
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>

      <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your list. Contact information should be in JSON format.
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            onSuccess={handleSuccess}
            onCancel={() => setIsAddingSupplier(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};