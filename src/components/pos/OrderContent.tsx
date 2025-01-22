import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";
import { Product } from "@/types/product";
import { Service } from "@/types/service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { ConsignmentGrid } from "./ConsignmentGrid";
import { useEffect, useState } from "react";
import { useTypes } from "@/hooks/useTypes";
import { Type } from "@/types/types";

interface OrderContentProps {
  sourceId: string;
  onProductSelect: (product: BillProduct) => void;
}

interface SourceData {
  id: string;
  name: string;
}

// Define consignment interface based on the database structure
interface Consignment {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  price: number;
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  image_url?: string;
}

export const OrderContent = ({ sourceId, onProductSelect }: OrderContentProps) => {
  const { types, isTypeEnabled, isLoadingTypes } = useTypes(sourceId);
  const [selectedTab, setSelectedTab] = useState<string>("");

  // Get type IDs
  const getTypeIdByName = (name: string): string | undefined => {
    return types.find(type => type.name.toLowerCase() === name.toLowerCase())?.id;
  };

  const productTypeId = getTypeIdByName('products');
  const serviceTypeId = getTypeIdByName('services');
  const consignmentTypeId = getTypeIdByName('consignments');

  // Debug log for types and enabled status
  useEffect(() => {
    console.log('Types loaded:', types);
    console.log('Selected tab:', selectedTab);
    console.log('Product type ID:', productTypeId);
    console.log('Service type ID:', serviceTypeId);
    console.log('Consignment type ID:', consignmentTypeId);
    if (productTypeId) console.log('Products enabled:', isTypeEnabled(productTypeId));
    if (serviceTypeId) console.log('Services enabled:', isTypeEnabled(serviceTypeId));
    if (consignmentTypeId) console.log('Consignments enabled:', isTypeEnabled(consignmentTypeId));
  }, [types, selectedTab, isTypeEnabled, productTypeId, serviceTypeId, consignmentTypeId]);
  
  const { data: sourceData } = useQuery<SourceData>({
    queryKey: ["source", sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("id, name")
        .eq("id", sourceId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products", sourceId],
    enabled: !!sourceId && !!productTypeId && isTypeEnabled(productTypeId),
    queryFn: async () => {
      console.log('Fetching products for source:', sourceId);
      console.log('Products type enabled:', productTypeId && isTypeEnabled(productTypeId));
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          source_id,
          name,
          description,
          category,
          price,
          product_type,
          measurement_unit_id,
          measurement_unit:measurement_unit_id (
            id,
            name,
            symbol
          ),
          current_stock,
          created_at,
          updated_at
        `)
        .eq("source_id", sourceId);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      console.log('Products fetched:', data);
      return data || [];
    },
  });

  const { data: consignments, isLoading: isLoadingConsignments } = useQuery<Consignment[]>({
    queryKey: ["consignments", sourceId],
    enabled: !!sourceId && !!consignmentTypeId && isTypeEnabled(consignmentTypeId),
    queryFn: async () => {
      console.log('Fetching consignments for source:', sourceId);
      console.log('Consignments type enabled:', consignmentTypeId && isTypeEnabled(consignmentTypeId));
      
      const { data, error } = await supabase
        .from("consignments")
        .select(`
          id,
          source_id,
          name,
          description,
          price,
          measurement_unit_id,
          measurement_unit:measurement_unit_id (
            id,
            name,
            symbol
          ),
          image_url
        `)
        .eq("source_id", sourceId);

      if (error) {
        console.error('Error fetching consignments:', error);
        throw error;
      }
      console.log('Consignments fetched:', data);
      return data || [];
    },
  });

  // Set initial selected tab
  useEffect(() => {
    if (types.length > 0 && !selectedTab) {
      const enabledTypes = types.filter(type => isTypeEnabled(type.id));
      if (enabledTypes.length > 0) {
        setSelectedTab(enabledTypes[0].id);
      }
    }
  }, [types, isTypeEnabled, selectedTab]);

  if (isLoadingTypes || !sourceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const enabledTypes = types.filter(type => isTypeEnabled(type.id));
  console.log('Enabled types:', enabledTypes);
  
  if (enabledTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No types enabled for this source. Enable them in source settings.</p>
      </div>
    );
  }

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
    price: consignment.price,
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