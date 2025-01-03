import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source as SourceType } from "@/types/source";
import { ProductGrid } from "@/components/products/ProductGrid";
import { OrderInterface } from "@/components/pos/OrderInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/source/CategoryManager";
import { SupplierManager } from "@/components/source/SupplierManager";
import { ExpenseInterface } from "@/components/expense/ExpenseInterface";
import { InventoryManager } from "@/components/inventory/InventoryManager";
import { RecurringTransactions } from "@/components/source/RecurringTransactions";
import { useToast } from "@/hooks/use-toast";

const Source = () => {
  const { sourceId } = useParams();
  const { toast } = useToast();

  const { data: source, isLoading, error } = useQuery({
    queryKey: ['source', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .maybeSingle();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading source",
          description: error.message,
        });
        throw error;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Source not found",
          description: "The requested source could not be found.",
        });
        throw new Error("Source not found");
      }

      return data as SourceType;
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Source</h2>
        <p className="text-gray-600 mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="income" className="h-full">
        <TabsList className="w-full justify-start border-b rounded-none px-4 bg-background">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="income" className="h-full m-0 p-0">
            <OrderInterface sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="expense" className="m-0">
            <ExpenseInterface sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="recurring" className="m-0">
            <RecurringTransactions sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="inventory" className="m-0">
            <InventoryManager sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="products" className="m-0">
            <ProductGrid sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="categories" className="m-0">
            <CategoryManager sourceId={sourceId!} />
          </TabsContent>

          <TabsContent value="suppliers" className="m-0">
            <SupplierManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Source;