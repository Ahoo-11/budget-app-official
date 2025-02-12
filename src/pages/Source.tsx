
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source as SourceType } from "@/types/source";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ServiceGrid } from "@/components/pos/ServiceGrid";
import { OrderInterface } from "@/components/pos/OrderInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/source/CategoryManager";
import { SupplierManager } from "@/components/source/SupplierManager";
import { ExpenseInterface } from "@/components/expense/ExpenseInterface";
import { InventoryIncome } from "@/components/income/InventoryIncome";
import { TypeSettings } from "@/components/source/TypeSettings";
import { TypesDropdownMenu } from "@/components/source/TypesDropdownMenu";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { EmploymentIncome } from "@/components/income/EmploymentIncome";
import { GiftsIncome } from "@/components/income/GiftsIncome";
import { ProductsList } from "@/components/types/ProductsList";
import { ProductDetail } from "@/components/products/ProductDetail";
import { SessionManager } from "@/components/session/SessionManager";
import { ConsignmentsList } from "@/components/types/ConsignmentsList";
import { ConsignmentDetail } from "@/components/types/detail/ConsignmentDetail";
import { ServicesList } from "@/components/types/ServicesList";
import { ServiceDetail } from "@/components/services/ServiceDetail";

const Source = () => {
  const { sourceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: source } = useQuery({
    queryKey: ['source', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgetapp_sources')
        .select('*')
        .eq('id', sourceId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Source not found");
      }

      return data as SourceType;
    },
    retry: 1
  });

  // If this is a POS source (has_products = true), show the POS interface
  if (source?.has_products) {
    return (
      <div className="flex flex-col h-full">
        <SessionManager sourceId={sourceId!} />
        <OrderInterface sourceId={sourceId!} />
      </div>
    );
  }

  // For regular budget sources, show the tabbed interface
  const getActiveTab = (): string => {
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/suppliers')) return 'suppliers';
    if (location.pathname.includes('/settings')) return 'settings';
    if (location.pathname.includes('/expense')) return 'expense';
    return 'income';
  };

  const handleTabChange = (value: string) => {
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
      <SessionManager sourceId={sourceId!} />
      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full mt-6">
        <div className="flex items-center justify-between border-b px-4">
          <div className="flex items-center space-x-2">
            <TabsList className="bg-background">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TypesDropdownMenu />
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/" element={<OrderInterface sourceId={sourceId!} />} />
            <Route path="types/products" element={<ProductsList sourceId={sourceId!} />} />
            <Route path="types/products/:productId" element={<ProductDetail />} />
            <Route path="types/services" element={<ServicesList sourceId={sourceId!} />} />
            <Route path="types/services/:serviceId" element={<ServiceDetail />} />
            <Route path="types/inventory" element={<InventoryIncome sourceId={sourceId!} />} />
            <Route path="types/employment" element={<EmploymentIncome sourceId={sourceId!} />} />
            <Route path="types/gifts" element={<GiftsIncome sourceId={sourceId!} />} />
            <Route path="types/consignments" element={<ConsignmentsList sourceId={sourceId!} />} />
            <Route path="types/consignments/:consignmentId" element={<ConsignmentDetail />} />
            <Route path="categories" element={<CategoryManager sourceId={sourceId!} />} />
            <Route path="suppliers" element={<SupplierManager />} />
            <Route path="settings" element={<TypeSettings sourceId={sourceId!} />} />
            <Route path="expense" element={<ExpenseInterface sourceId={sourceId!} />} />
          </Routes>
        </div>
      </Tabs>
    </div>
  );
};

export default Source;
