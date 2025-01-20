import { useState } from "react";
import { Service } from "@/types/service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ServiceBasicInfo } from "./form/ServiceBasicInfo";
import { ServicePricing } from "./form/ServicePricing";

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
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
          
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Service ${service ? 'updated' : 'created'} successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ServiceBasicInfo
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
      />

      <ServicePricing
        price={price}
        setPrice={setPrice}
        measurementUnitId={measurementUnitId}
        setMeasurementUnitId={setMeasurementUnitId}
        measurementUnits={measurementUnits}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {service ? "Updating..." : "Creating..."}
          </>
        ) : (
          service ? "Update Service" : "Create Service"
        )}
      </Button>
    </form>
  );
};