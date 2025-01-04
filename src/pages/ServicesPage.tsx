import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { ServiceForm } from "@/components/services/ServiceForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServicesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Service[];
    },
  });

  if (isLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Service</Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>Enter the details for the new service</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm
              sourceId="default"
              onSuccess={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">${service.price}</p>
              <p className="text-gray-600">{service.description}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingService(service)}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Edit Service</CardTitle>
              <CardDescription>Update the service details</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceForm
                sourceId={editingService.source_id}
                service={editingService}
                onSuccess={() => setEditingService(null)}
              />
              <Button
                variant="ghost"
                onClick={() => setEditingService(null)}
                className="mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
