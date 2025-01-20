import { Service } from "@/types/service";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceForm } from "@/components/services/ServiceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServiceGridProps {
  sourceId: string;
  services?: Service[];
  onSelect?: (service: Service) => void;
}

export const ServiceGrid = ({ sourceId, services: propServices, onSelect }: ServiceGridProps) => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("source_id", sourceId)
        .order("name");
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !propServices && !!sourceId,
  });

  if (isLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Button onClick={() => setIsAddingService(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-4 border rounded-lg ${onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            onClick={() => onSelect?.(service)}
          >
            <h3 className="font-medium text-sm">{service.name}</h3>
            <p className="text-sm text-muted-foreground">MVR {service.price.toFixed(2)}</p>
            {service.description && (
              <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
            )}
          </div>
        ))}
      </div>

      <Dialog 
        open={isAddingService} 
        onOpenChange={setIsAddingService}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingService(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!editingService} 
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              sourceId={sourceId}
              service={editingService}
              onSuccess={() => setEditingService(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};