import { useState } from "react";
import { Service } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Service name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
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
        <label className="block text-sm font-medium mb-2">Category</label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Service category"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
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