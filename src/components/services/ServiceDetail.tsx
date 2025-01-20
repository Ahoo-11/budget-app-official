import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceHeader } from "./detail/ServiceHeader";
import { ServiceOverview } from "./detail/ServiceOverview";

export const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState<Partial<Service>>({});

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, measurement_units(*)')
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading service",
          description: error.message,
        });
        throw error;
      }

      return data as Service;
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (updatedService: Partial<Service>) => {
      const { error } = await supabase
        .from('services')
        .update(updatedService)
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating service",
        description: error.message,
      });
    },
  });

  const handleEditClick = () => {
    setEditedService(service || {});
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (!editedService) return;
    updateServiceMutation.mutate(editedService);
  };

  const handleCancelClick = () => {
    setEditedService({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold text-red-600">Service Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested service could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceHeader
        name={service.name}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
        editedName={editedService.name}
        onNameChange={(name) => setEditedService(prev => ({ ...prev, name }))}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ServiceOverview
            service={service}
            isEditing={isEditing}
            editedService={editedService}
            onServiceChange={setEditedService}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              Service history coming soon...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="pt-6">
              Analytics coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};