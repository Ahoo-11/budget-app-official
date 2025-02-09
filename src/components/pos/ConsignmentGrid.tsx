import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ConsignmentForm } from "@/components/types/ConsignmentForm";
import { ConsignmentCard } from "@/components/types/ConsignmentCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Consignment {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  price: number;
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  image_url?: string;
}

interface ConsignmentGridProps {
  sourceId: string;
  consignments?: Consignment[];
  onSelect?: (consignment: Consignment) => void;
  onAddConsignment?: () => void;
}

export const ConsignmentGrid = ({ 
  sourceId, 
  consignments: propConsignments, 
  onSelect,
  onAddConsignment 
}: ConsignmentGridProps) => {
  const [isAddingConsignment, setIsAddingConsignment] = useState(false);
  
  const { data: consignments = [], isLoading } = useQuery({
    queryKey: ["consignments", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_consignments")
        .select("*")
        .eq("source_id", sourceId)
        .order("date", { ascending: false });
      
      if (error) {
        console.error('Error fetching consignments:', error);
        throw error;
      }
      if (!data) {
        return [];
      }
      return data.map((consignment: any) => ({
        id: consignment.id,
        source_id: consignment.source_id,
        name: consignment.name,
        description: consignment.description,
        price: consignment.price,
        measurement_unit_id: consignment.measurement_unit_id,
        measurement_unit: consignment.measurement_unit,
        image_url: consignment.image_url,
      }));
    },
    enabled: !propConsignments,
  });

  const displayConsignments = propConsignments || consignments;

  const handleConsignmentClick = (consignment: Consignment) => {
    if (onSelect) {
      onSelect(consignment);
    }
  };

  const handleAddSuccess = () => {
    setIsAddingConsignment(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayConsignments.map((consignment) => (
          <ConsignmentCard
            key={consignment.id}
            consignment={consignment}
            onClick={() => handleConsignmentClick(consignment)}
          />
        ))}
      </div>

      <Dialog open={isAddingConsignment} onOpenChange={setIsAddingConsignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Consignment</DialogTitle>
          </DialogHeader>
          <ConsignmentForm
            sourceId={sourceId}
            onSuccess={handleAddSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
