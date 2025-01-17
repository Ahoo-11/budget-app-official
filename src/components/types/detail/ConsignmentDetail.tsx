import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ConsignmentHeader } from "./ConsignmentHeader";
import { ConsignmentImage } from "./ConsignmentImage";
import { ConsignmentQuickStats } from "./ConsignmentQuickStats";
import { ConsignmentAlertCards } from "./ConsignmentAlertCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsignmentOverviewTab } from "./tabs/ConsignmentOverviewTab";

interface ConsignmentDetailProps {
  consignmentId: string;
}

export const ConsignmentDetail = ({ consignmentId }: ConsignmentDetailProps) => {
  const { data: consignment, isLoading, error } = useQuery({
    queryKey: ['consignments', consignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          suppliers (
            name,
            contact_info,
            address
          ),
          supplier_settlement_terms!inner (
            settlement_frequency,
            payment_terms,
            commission_rate
          )
        `)
        .eq('id', consignmentId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading consignment details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!consignment) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Consignment not found.
        </AlertDescription>
      </Alert>
    );
  }

  // Transform the data to match the expected types
  const transformedConsignment = {
    ...consignment,
    suppliers: consignment.suppliers ? {
      name: consignment.suppliers.name,
      contact_info: consignment.suppliers.contact_info,
      address: consignment.suppliers.address
    } : undefined,
    supplier_settlement_terms: consignment.supplier_settlement_terms ? {
      settlement_frequency: consignment.supplier_settlement_terms.settlement_frequency,
      payment_terms: consignment.supplier_settlement_terms.payment_terms,
      commission_rate: consignment.supplier_settlement_terms.commission_rate
    } : undefined
  };

  return (
    <div className="space-y-6">
      <ConsignmentHeader consignment={transformedConsignment} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <ConsignmentImage imageUrl={consignment.image_url} name={consignment.name} />
        <div className="space-y-6">
          <ConsignmentQuickStats consignment={transformedConsignment} />
          <ConsignmentAlertCards consignment={transformedConsignment} />
        </div>
      </div>

      <Card>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="history">Stock History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <ConsignmentOverviewTab consignment={transformedConsignment} />
          </TabsContent>
          <TabsContent value="settlements">
            Settlement history coming soon...
          </TabsContent>
          <TabsContent value="history">
            Stock history coming soon...
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};