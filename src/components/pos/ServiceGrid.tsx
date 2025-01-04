import { Service } from "@/types/service";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceGridProps {
  sourceId: string;
  services?: Service[];
  onSelect?: (service: Service) => void;
}

export const ServiceGrid = ({ sourceId, services: propServices, onSelect }: ServiceGridProps) => {
  const { data: fetchedServices = [] } = useQuery({
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

  const services = propServices || fetchedServices;

  if (!services?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services found
      </div>
    );
  }

  return (
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
  );
};