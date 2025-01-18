import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ConsignmentHeader } from "./ConsignmentHeader";
import { ConsignmentImage } from "./ConsignmentImage";
import { ConsignmentQuickStats } from "./ConsignmentQuickStats";
import { ConsignmentAlertCards } from "./ConsignmentAlertCards";
import { ConsignmentOverviewTab } from "./tabs/ConsignmentOverviewTab";

export const ConsignmentDetail = () => {
  console.log("ConsignmentDetail component mounted");
  const { consignmentId } = useParams();
  console.log("ConsignmentId from params:", consignmentId);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedConsignment, setEditedConsignment] = useState<any>({});

  const { data: consignment, isLoading, error } = useQuery({
    queryKey: ['consignment', consignmentId],
    queryFn: async () => {
      console.log("Starting consignment fetch for ID:", consignmentId);
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          suppliers (
            name,
            contact_info,
            address,
            supplier_settlement_terms (
              settlement_frequency,
              payment_terms,
              commission_rate
            )
          )
        `)
        .eq('id', consignmentId)
        .maybeSingle();

      if (error) {
        console.error("Supabase query error:", error);
        toast({
          variant: "destructive",
          title: "Error loading consignment",
          description: error.message,
        });
        throw error;
      }

      if (!data) {
        console.log("No consignment found for ID:", consignmentId);
        toast({
          variant: "destructive",
          title: "Consignment not found",
          description: "The requested consignment could not be found.",
        });
        throw new Error("Consignment not found");
      }

      console.log("Successfully fetched consignment data:", data);
      return data;
    },
    meta: {
      errorHandler: (error: Error) => {
        console.error("Query error handler:", error);
      }
    }
  });

  const updateConsignmentMutation = useMutation({
    mutationFn: async (updatedConsignment: any) => {
      const { error } = await supabase
        .from('consignments')
        .update(updatedConsignment)
        .eq('id', consignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignment', consignmentId] });
      toast({
        title: "Success",
        description: "Consignment updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating consignment",
        description: error.message,
      });
    },
  });

  const handleEditClick = () => {
    setEditedConsignment(consignment || {});
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (!editedConsignment) return;
    updateConsignmentMutation.mutate(editedConsignment);
  };

  const handleCancelClick = () => {
    setEditedConsignment({});
    setIsEditing(false);
  };

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !consignment) {
    console.log("Rendering error state:", error);
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold text-red-600">Error Loading Consignment</h2>
        <p className="text-muted-foreground mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  console.log("Rendering consignment detail view:", consignment);

  return (
    <div className="space-y-6">
      <ConsignmentHeader 
        name={consignment.name}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
        editedName={editedConsignment.name}
        onNameChange={(name) => setEditedConsignment(prev => ({ ...prev, name }))}
      />

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <div className="space-y-4">
          <ConsignmentImage 
            imageUrl={consignment.image_url} 
            name={consignment.name}
            isEditing={isEditing}
            onImageChange={(file) => {
              // Handle image upload
            }}
          />
          <ConsignmentQuickStats 
            consignment={consignment}
          />
          <ConsignmentAlertCards 
            consignment={consignment}
          />
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settlements">Settlements</TabsTrigger>
              <TabsTrigger value="history">Stock History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ConsignmentOverviewTab 
                consignment={consignment}
                isEditing={isEditing}
                editedConsignment={editedConsignment}
                onConsignmentChange={setEditedConsignment}
              />
            </TabsContent>

            <TabsContent value="settlements">
              <Card>
                <CardContent className="pt-6">
                  Settlement history coming soon...
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="pt-6">
                  Stock history coming soon...
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};