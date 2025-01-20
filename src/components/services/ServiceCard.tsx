import { Service } from "@/types/service";
import { Briefcase } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

export const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  return (
    <div
      className="group relative overflow-hidden rounded-lg border p-3 space-y-3 hover:border-accent transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden rounded-md">
        <div className="flex h-full items-center justify-center bg-secondary">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{service.name}</h3>
        <p className="text-xs text-muted-foreground">MVR {service.price.toFixed(2)}</p>
        {service.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}
        {service.measurement_unit && (
          <p className="text-xs text-muted-foreground">
            Unit: {service.measurement_unit.name} ({service.measurement_unit.symbol})
          </p>
        )}
      </div>
    </div>
  );
};
