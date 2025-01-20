import { Service } from "@/types/service";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceOverviewProps {
  service: Service;
  isEditing: boolean;
  editedService: Partial<Service>;
  onServiceChange: (service: Partial<Service>) => void;
}

export const ServiceOverview = ({
  service,
  isEditing,
  editedService,
  onServiceChange,
}: ServiceOverviewProps) => {
  const { data: measurementUnits = [] } = useQuery({
    queryKey: ['measurement-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurement_units')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price</Label>
            {isEditing ? (
              <Input
                type="number"
                value={editedService.price}
                onChange={(e) => onServiceChange({ ...editedService, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
              />
            ) : (
              <p className="text-lg font-medium">MVR {service.price?.toFixed(2)}</p>
            )}
          </div>

          <div>
            <Label>Category</Label>
            {isEditing ? (
              <Input
                value={editedService.category}
                onChange={(e) => onServiceChange({ ...editedService, category: e.target.value })}
              />
            ) : (
              <p className="text-lg">{service.category || 'Uncategorized'}</p>
            )}
          </div>

          <div>
            <Label>Measurement Unit</Label>
            {isEditing ? (
              <Select
                value={editedService.measurement_unit_id}
                onValueChange={(value) => onServiceChange({ ...editedService, measurement_unit_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {measurementUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-lg">{service.measurement_unit?.name || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Description</Label>
          {isEditing ? (
            <Textarea
              value={editedService.description}
              onChange={(e) => onServiceChange({ ...editedService, description: e.target.value })}
              className="mt-2"
            />
          ) : (
            <p className="text-lg mt-2">{service.description || 'No description provided'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};