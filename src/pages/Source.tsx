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
import { useToast } from "@/hooks/use-toast";
import { IncomeTypeSettings } from "@/components/source/IncomeTypeSettings";
import { TypesDropdownMenu } from "@/components/source/TypesDropdownMenu";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { EmploymentIncome } from "@/components/income/EmploymentIncome";
import { GiftsIncome } from "@/components/income/GiftsIncome";

type TabValue = 'income' | 'expense' | 'categories' | 'suppliers' | 'settings';

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
  const getActiveTab = (): TabValue => {
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/suppliers')) return 'suppliers';
    if (location.pathname.includes('/settings')) return 'settings';
    if (location.pathname.includes('/expense')) return 'expense';
    return 'income';
  };

  // Navigation handler
  const handleTabChange = (value: TabValue) => {
    switch (value) {
      case 'categories':
        navigate(`/source/${sourceId}/categories`);
        break;
      case 'suppliers':
        navigate(`/source/${sourceId}/suppliers`);
        break;
      case 'settings':
        navigate(`/source/${sourceId}/settings`);
        break;
      case 'expense':
        navigate(`/source/${sourceId}/expense`);
        break;
      default:
        navigate(`/source/${sourceId}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="bg-background">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TypesDropdownMenu />
        </div>
      </Tabs>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="products" element={<ProductGrid sourceId={sourceId!} />} />
          <Route path="services" element={<ServiceGrid sourceId={sourceId!} />} />
          <Route path="income/employment" element={<EmploymentIncome sourceId={sourceId!} />} />
          <Route path="income/gifts" element={<GiftsIncome sourceId={sourceId!} />} />
          <Route path="categories" element={<CategoryManager sourceId={sourceId!} />} />
          <Route path="suppliers" element={<SupplierManager />} />
          <Route path="settings" element={<IncomeTypeSettings sourceId={sourceId!} />} />
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
              </div>
            </Tabs>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default Source;
