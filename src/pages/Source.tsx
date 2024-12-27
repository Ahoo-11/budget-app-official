import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source as SourceType } from "@/types/source";
import { ProductGrid } from "@/components/products/ProductGrid";
import { OrderInterface } from "@/components/pos/OrderInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Source = () => {
  const { sourceId } = useParams();

  const { data: source } = useQuery({
    queryKey: ['source', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();
      
      if (error) throw error;
      return data as SourceType;
    }
  });

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">{source?.name || 'Loading...'}</h2>
        
        <Tabs defaultValue="pos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pos">POS</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="pos">
            <OrderInterface sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="products">
            <ProductGrid sourceId={sourceId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Source;