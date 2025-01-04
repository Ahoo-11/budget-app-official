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
import { TypesDropdownMenu } from "@/components/source/TypesDropdownMenu";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { EmploymentIncome } from "@/components/income/EmploymentIncome";

const Source = () => {
  const { sourceId } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Helper function to determine active tab
  const getActiveTab = () => {
    if (location.pathname.includes('/products')) return 'products';
    if (location.pathname.includes('/services')) return 'services';
    if (location.pathname.includes('/income/employment')) return 'employment';
    if (location.pathname.includes('/income/gifts')) return 'gifts';
    if (location.pathname.includes('/income/investments')) return 'investments';
    if (location.pathname.includes('/income/other')) return 'other';
    return 'income';
  };

  // Navigation handler
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'products':
        navigate(`/source/${sourceId}/products`);
        break;
      case 'services':
        navigate(`/source/${sourceId}/services`);
        break;
      case 'employment':
        navigate(`/source/${sourceId}/income/employment`);
        break;
      default:
        navigate(`/source/${sourceId}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TabsList className="w-full justify-start border-b rounded-none px-4 bg-background">
        <TabsTrigger 
          value="income" 
          onClick={() => handleTabChange('income')}
          data-state={getActiveTab() === 'income' ? 'active' : ''}
        >
          Income
        </TabsTrigger>
        <TabsTrigger 
          value="expense" 
          onClick={() => handleTabChange('expense')}
          data-state={getActiveTab() === 'expense' ? 'active' : ''}
        >
          Expense
        </TabsTrigger>
        <TabsTrigger 
          value="products" 
          onClick={() => handleTabChange('products')}
          data-state={getActiveTab() === 'products' ? 'active' : ''}
        >
          Products
        </TabsTrigger>
        <TabsTrigger 
          value="services" 
          onClick={() => handleTabChange('services')}
          data-state={getActiveTab() === 'services' ? 'active' : ''}
        >
          Services
        </TabsTrigger>
        <div className="mx-1">
          <TypesDropdownMenu />
        </div>
      </TabsList>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="products" element={<ProductGrid sourceId={sourceId!} />} />
          <Route path="services" element={<ServiceGrid sourceId={sourceId!} />} />
          <Route path="income/employment" element={<EmploymentIncome sourceId={sourceId!} />} />
          <Route path="*" element={
            <Tabs defaultValue="income" className="h-full">
              <div className="flex-1 overflow-auto">
                <TabsContent value="income" className="h-full m-0 p-0">
                  <OrderInterface sourceId={sourceId!} />
                </TabsContent>

                <TabsContent value="expense" className="m-0">
                  <ExpenseInterface sourceId={sourceId!} />
                </TabsContent>

                <TabsContent value="inventory" className="m-0">
                  <InventoryManager sourceId={sourceId!} />
                </TabsContent>

                <TabsContent value="categories" className="m-0">
                  <CategoryManager sourceId={sourceId!} />
                </TabsContent>

                <TabsContent value="suppliers" className="m-0">
                  <SupplierManager />
                </TabsContent>

                <TabsContent value="settings" className="m-0 p-4">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div id="income-types">
                      <h2 className="text-2xl font-bold mb-4">Income Type Settings</h2>
                      <IncomeTypeSettings sourceId={sourceId!} />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default Source;