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
import { ServiceGrid } from "@/components/pos/ServiceGrid";
import { useToast } from "@/hooks/use-toast";
import { IncomeTypeSettings } from "@/components/source/IncomeTypeSettings";
import { useIncomeTypes } from "@/hooks/useIncomeTypes";

const Source = () => {
  const { sourceId } = useParams();
  const { toast } = useToast();
  const { incomeTypes, isLoadingTypes, isIncomeTypeEnabled } = useIncomeTypes(sourceId!);

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

  if (isLoading || isLoadingTypes) {
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
      <Tabs defaultValue="types" className="h-full">
        <TabsList className="w-full justify-start border-b rounded-none px-4 bg-background">
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="types" className="m-0">
            <Tabs defaultValue="products-section" orientation="vertical" className="h-full">
              <div className="flex h-full">
                <TabsList className="w-48 h-full flex-col items-stretch border-r">
                  <div className="px-2 py-3 font-medium text-sm text-muted-foreground">
                    Products & Services
                  </div>
                  <TabsTrigger value="products-section" className="justify-start">Products</TabsTrigger>
                  <TabsTrigger value="inventory-section" className="justify-start">Inventory</TabsTrigger>
                  <TabsTrigger value="services-section" className="justify-start">Services</TabsTrigger>
                  
                  <div className="px-2 py-3 font-medium text-sm text-muted-foreground mt-4">
                    Income Types
                  </div>
                  {incomeTypes.map((type) => (
                    isIncomeTypeEnabled(type.id) && (
                      <TabsTrigger 
                        key={type.id} 
                        value={`income-${type.id}`}
                        className="justify-start"
                      >
                        {type.name}
                      </TabsTrigger>
                    )
                  ))}

                  <div className="px-2 py-3 font-medium text-sm text-muted-foreground mt-4">
                    Management
                  </div>
                  <TabsTrigger value="categories-section" className="justify-start">Categories</TabsTrigger>
                  <TabsTrigger value="suppliers-section" className="justify-start">Suppliers</TabsTrigger>
                  <TabsTrigger value="settings-section" className="justify-start">Settings</TabsTrigger>
                </TabsList>

                <div className="flex-1 p-6">
                  <TabsContent value="products-section">
                    <ProductGrid sourceId={sourceId!} />
                  </TabsContent>

                  <TabsContent value="inventory-section">
                    <InventoryManager sourceId={sourceId!} />
                  </TabsContent>

                  <TabsContent value="services-section">
                    <ServiceGrid sourceId={sourceId!} onSelect={() => {}} />
                  </TabsContent>

                  {incomeTypes.map((type) => (
                    <TabsContent key={type.id} value={`income-${type.id}`}>
                      <OrderInterface sourceId={sourceId!} />
                    </TabsContent>
                  ))}

                  <TabsContent value="categories-section">
                    <CategoryManager sourceId={sourceId!} />
                  </TabsContent>

                  <TabsContent value="suppliers-section">
                    <SupplierManager />
                  </TabsContent>

                  <TabsContent value="settings-section">
                    <div className="max-w-4xl space-y-8">
                      <IncomeTypeSettings sourceId={sourceId!} />
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Source;