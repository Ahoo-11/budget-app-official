import { useState } from "react";
import { Service } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ServiceFormProps {
  sourceId: string;
  onSuccess?: () => void;
  service?: Service;
}

export const ServiceForm = ({ sourceId, onSuccess, service }: ServiceFormProps) => {
  const [name, setName] = useState(service?.name || "");
  const [price, setPrice] = useState(service?.price?.toString() || "");
  const [category, setCategory] = useState(service?.category || "");
  const [description, setDescription] = useState(service?.description || "");
  const [measurementUnitId, setMeasurementUnitId] = useState(service?.measurement_unit_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceData = {
        source_id: sourceId,
        name,
        price: parseFloat(price),
        category,
        description,
        measurement_unit_id: measurementUnitId || null,
      };

      if (service) {
        await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);
      } else {
        await supabase
          .from('services')
          .insert([serviceData]);
      }

      toast({
        title: "Success",
        description: `Service ${service ? 'updated' : 'created'} successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess?.();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Service name"
        />
      </div>

      <div>
        <Label>Price</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="Service price"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Service category"
        />
      </div>

      <div>
        <Label>Measurement Unit</Label>
        <Select value={measurementUnitId} onValueChange={setMeasurementUnitId}>
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
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Service description"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : service ? "Update Service" : "Create Service"}
      </Button>
    </form>
  );
};