import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";

interface ServiceGridProps {
  sourceId: string;
  onSelect: (service: Service) => void;
}

export const ServiceGrid = ({ sourceId, onSelect }: ServiceGridProps) => {
  const { data: services = [] } = useQuery({
    queryKey: ['services', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  if (!services.length) {
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
          className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
          onClick={() => onSelect(service)}
        >
          <h3 className="font-medium text-sm">{service.name}</h3>
          <p className="text-sm text-muted-foreground">MVR {service.price.toFixed(2)}</p>
          {service.description && (
            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
          )}
        </div>
      </div>
    ));
  }