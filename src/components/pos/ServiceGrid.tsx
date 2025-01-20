import { Service } from "@/types/service";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceForm } from "@/components/services/ServiceForm";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
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

  const handleServiceClick = (service: Service) => {
    if (onSelect) {
      onSelect(service);
    } else {
      navigate(`/source/${sourceId}/types/services/${service.id}`);
    }
  };

  if (isLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 space-y-2"
            onClick={() => handleServiceClick(service)}
          >
            <h3 className="font-medium text-sm">{service.name}</h3>
            <p className="text-sm text-muted-foreground">MVR {service.price.toFixed(2)}</p>
            {service.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
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
    </div>
  );
};