import { useParams } from "react-router-dom";
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
    <div className="container max-w-full mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{source?.name || 'Loading...'}</h2>
      </div>
      
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="border-b w-full justify-start">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="m-0">
          <OrderInterface sourceId={sourceId!} type="income" />
        </TabsContent>

        <TabsContent value="expense" className="m-0">
          <OrderInterface sourceId={sourceId!} type="expense" />
        </TabsContent>

        <TabsContent value="products" className="m-0">
          <ProductGrid sourceId={sourceId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Source;