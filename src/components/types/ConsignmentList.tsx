import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface ConsignmentListProps {
  sourceId: string;
}

export const ConsignmentList = ({ sourceId }: ConsignmentListProps) => {
  const navigate = useNavigate();
  const { data: consignments, isLoading } = useQuery({
    queryKey: ['consignments', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consignments')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {consignments?.map((consignment) => (
        <Card 
          key={consignment.id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/source/${sourceId}/types/consignments/${consignment.id}`)}
        >
          <CardContent className="p-6">
            <div className="aspect-square relative rounded-lg overflow-hidden mb-4 bg-muted">
              {consignment.image_url ? (
                <img
                  src={consignment.image_url}
                  alt={consignment.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-medium mb-2">{consignment.name}</h3>
            <div className="text-sm text-muted-foreground">
              Stock: {consignment.current_stock || 0}
            </div>
            <div className="text-sm font-medium mt-2">
              MVR {consignment.selling_price?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};