import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { ConsignmentGrid } from "./ConsignmentGrid";
import { useState, useEffect } from "react";
import { useTypes } from "@/hooks/useTypes";
import { Type } from "@/types/types";
import { useToast } from "../ui/use-toast";

type SourceData = Pick<Tables['sources']['Row'], 'id' | 'name'>;
type SourceType = Tables['source_types']['Row'];
type Product = Tables['products']['Row'] & {
  measurement_unit?: Tables['measurement_units']['Row']
};

type Service = Tables['services']['Row'] & {
  measurement_unit?: Tables['measurement_units']['Row']
};

type Consignment = Tables['consignments']['Row'] & {
  measurement_unit?: Tables['measurement_units']['Row']
};

interface OrderContentProps {
  sourceId: string;
  onProductSelect: (product: BillProduct) => void;
}

export const OrderContent = ({ sourceId, onProductSelect }: OrderContentProps) => {
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  
  // Get enabled types first since other queries depend on it
  const { types: enabledTypes, isTypeEnabled } = useTypes(sourceId);
  
  // Helper functions for type IDs
  const getTypeIdByName = (name: string): string | undefined => {
    return enabledTypes.find(type => type.name.toLowerCase() === name.toLowerCase())?.id;
  };

  const productTypeId = getTypeIdByName('products');
  const serviceTypeId = getTypeIdByName('services');
  const consignmentTypeId = getTypeIdByName('consignments');

  // Data fetching hooks
  const { data: types = [], isLoading: isLoadingTypes } = useQuery<SourceType[]>({
    queryKey: ["source_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_source_types")
        .select("*");
      if (error) throw error;
      return data as SourceType[];
    },
  });

  const { data: sourceData, error: sourceError } = useQuery<SourceData>({
    queryKey: ["source", sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_sources")
        .select("id, name")
        .eq("id", sourceId)
        .single();

      if (error) {
        console.error('Error fetching source:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load source details.",
        });
        throw error;
      }

      return data as SourceData;
    },
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products", sourceId],
    enabled: !!sourceId && !!productTypeId && isTypeEnabled(productTypeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_products")
        .select(`
          id,
          source_id,
          name,
          description,
          category,
          price,
          product_type,
          measurement_unit_id,
          measurement_unit:measurement_units(id, name, symbol)
        `)
        .eq("source_id", sourceId);

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products.",
        });
        throw error;
      }

      // Transform the data to match our Product type
      return data.map(item => ({
        ...item,
        measurement_unit: item.measurement_unit[0] // Take first item since it's returned as array
      }));
    },
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ["services", sourceId],
    enabled: !!sourceId && !!serviceTypeId && isTypeEnabled(serviceTypeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_services")
        .select(`
          id,
          source_id,
          name,
          description,
          price,
          measurement_unit_id,
          measurement_unit:measurement_units(id, name, symbol)
        `)
        .eq("source_id", sourceId);

      if (error) throw error;
      return data as Service[];
    },
  });

  const { data: consignments = [], isLoading: isLoadingConsignments } = useQuery<Consignment[]>({
    queryKey: ["consignments", sourceId],
    enabled: !!sourceId && !!consignmentTypeId && isTypeEnabled(consignmentTypeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgetapp_consignments")
        .select(`
          id,
          source_id,
          name,
          description,
          selling_price,
          measurement_unit_id,
          measurement_unit:measurement_units(id, name, symbol)
        `)
        .eq("source_id", sourceId);

      if (error) throw error;
      return data as Consignment[];
    },
  });

  // Effects
  useEffect(() => {
    if (enabledTypes.length > 0 && !selectedTab) {
      const availableTypes = enabledTypes.filter(type => isTypeEnabled(type.id));
      if (availableTypes.length > 0) {
        setSelectedTab(availableTypes[0].id);
      }
    }
  }, [enabledTypes, isTypeEnabled, selectedTab]);

  useEffect(() => {
    console.log('Selected tab:', selectedTab);
    console.log('Product type ID:', productTypeId);
    console.log('Service type ID:', serviceTypeId);
    console.log('Consignment type ID:', consignmentTypeId);
    if (productTypeId) console.log('Products enabled:', isTypeEnabled(productTypeId));
    if (serviceTypeId) console.log('Services enabled:', isTypeEnabled(serviceTypeId));
    if (consignmentTypeId) console.log('Consignments enabled:', isTypeEnabled(consignmentTypeId));
  }, [selectedTab, productTypeId, serviceTypeId, consignmentTypeId, isTypeEnabled]);

  // Loading and error states
  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (sourceError) {
    console.error('Error fetching source:', sourceError);
    return (
      <div className="p-4 text-red-500">
        Oops! Something went wrong while loading the source. Please try again.
      </div>
    );
  }

  if (!sourceData) {
    return (
      <div className="p-4 text-gray-500">
        Loading source data...
      </div>
    );
  }

  // Helper functions for transforming data
  const transformProductToBillProduct = (product: Product): BillProduct => ({
    id: product.id,
    type: "product",
    name: product.name,
    price: product.price,
    quantity: 1,
    measurement_unit: product.measurement_unit,
    source_id: sourceId,
    current_stock: product.current_stock || 0,
    purchase_cost: null,
    category: product.category,
    description: product.description || null,
    image_url: null,
    income_type_id: null,
    measurement_unit_id: product.measurement_unit_id
  });

  const transformServiceToBillProduct = (service: Service): BillProduct => ({
    id: service.id,
    type: "service",
    name: service.name,
    price: service.price,
    quantity: 1,
    measurement_unit: service.measurement_unit,
    source_id: sourceId,
    current_stock: 0,
    purchase_cost: null,
    category: service.category,
    description: service.description || null,
    image_url: null,
    income_type_id: null,
    measurement_unit_id: service.measurement_unit_id
  });

  const transformConsignmentToBillProduct = (consignment: Consignment): BillProduct => ({
    id: consignment.id,
    type: "consignment",
    name: consignment.name,
    price: consignment.selling_price,
    quantity: 1,
    measurement_unit: consignment.measurement_unit,
    source_id: sourceId,
    current_stock: 0,
    purchase_cost: null,
    category: undefined,
    description: consignment.description || null,
    image_url: consignment.image_url || null,
    income_type_id: null,
    measurement_unit_id: consignment.measurement_unit_id
  });

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
      <TabsList>
        {enabledTypes.map(type => (
          <TabsTrigger key={type.id} value={type.id}>
            {type.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {enabledTypes.map(type => (
        <TabsContent key={type.id} value={type.id} className="h-[calc(100%-40px)]">
          {type.id === productTypeId && (
            <ProductGrid 
              sourceId={sourceId} 
              products={products || []} 
              onSelect={(product) => onProductSelect(transformProductToBillProduct(product))} 
            />
          )}
          {type.id === serviceTypeId && (
            <ServiceGrid 
              sourceId={sourceId} 
              services={services || []}
              onSelect={(service) => onProductSelect(transformServiceToBillProduct(service))} 
            />
          )}
          {type.id === consignmentTypeId && (
            <ConsignmentGrid 
              sourceId={sourceId} 
              consignments={consignments || []}
              onSelect={(consignment) => onProductSelect(transformConsignmentToBillProduct(consignment))} 
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};