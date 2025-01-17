import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsignmentForm } from "./ConsignmentForm";

interface ConsignmentListProps {
  sourceId: string;
}

export const ConsignmentList = ({ sourceId }: ConsignmentListProps) => {
  const [isAddingConsignment, setIsAddingConsignment] = useState(false);

  const { data: consignments, isLoading } = useQuery({
    queryKey: ['consignments', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consignments')
        .select('*, suppliers(name)')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading consignments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Consignment Products</h3>
        <Button onClick={() => setIsAddingConsignment(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Consignment
        </Button>
      </div>

      <div className="grid gap-4">
        {consignments?.map((consignment) => (
          <div
            key={consignment.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{consignment.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Supplier: {consignment.suppliers.name}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">₱{consignment.selling_price}</div>
                <div className="text-sm text-muted-foreground">
                  Cost: ₱{consignment.unit_cost}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Stock: {consignment.current_stock}</span>
              <span>Min. Level: {consignment.minimum_stock_level}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog 
        open={isAddingConsignment} 
        onOpenChange={setIsAddingConsignment}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Add New Consignment</DialogTitle>
          </DialogHeader>
          <ConsignmentForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingConsignment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};