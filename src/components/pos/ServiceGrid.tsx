import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/client";
import { useState } from "react";
import { ServiceForm } from "@/components/services/ServiceForm";
import { useNavigate } from "react-router-dom";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Service = Tables['services']['Row'] & {
  measurement_unit?: Tables['measurement_units']['Row']
};

interface ServiceGridProps {
  sourceId: string;
  services?: Service[];
  onSelect?: (service: Service) => void;
  onAddService?: () => void;
}

export const ServiceGrid = ({ 
  sourceId, 
  services: propServices, 
  onSelect,
  onAddService 
}: ServiceGridProps) => {
  const [isAddingService, setIsAddingService] = useState(false);
  const navigate = useNavigate();
  
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          measurement_unit:measurement_unit_id (
            id,
            name,
            symbol
          )
        `)
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
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const displayedServices = propServices || services;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayedServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => handleServiceClick(service)}
          />
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
            onSuccess={() => {
              setIsAddingService(false);
              onAddService?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};