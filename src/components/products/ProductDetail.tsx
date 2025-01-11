import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProductHeader } from "./detail/ProductHeader";
import { ProductImage } from "./detail/ProductImage";
import { QuickStats } from "./detail/QuickStats";
import { AlertCards } from "./detail/AlertCards";
import { OverviewTab } from "./detail/tabs/OverviewTab";

export const ProductDetail = () => {
  const { productId } = useParams();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading product",
          description: error.message,
        });
        throw error;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Product not found",
          description: "The requested product could not be found.",
        });
        throw new Error("Product not found");
      }

      return data as Product;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold text-red-600">Error Loading Product</h2>
        <p className="text-muted-foreground mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductHeader name={product.name} />

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <div className="space-y-4">
          <ProductImage imageUrl={product.image_url} name={product.name} />
          <QuickStats currentStock={product.current_stock} price={product.price} />
          <AlertCards 
            currentStock={product.current_stock} 
            minimumStockLevel={product.minimum_stock_level} 
          />
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stock">Stock History</TabsTrigger>
              {product.product_type === 'composite' && (
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
              )}
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab product={product} />
            </TabsContent>

            <TabsContent value="stock">
              <Card>
                <CardContent className="pt-6">
                  Stock history coming soon...
                </CardContent>
              </Card>
            </TabsContent>

            {product.product_type === 'composite' && (
              <TabsContent value="recipe">
                <Card>
                  <CardContent className="pt-6">
                    Recipe details coming soon...
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="analytics">
              <Card>
                <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  Settings coming soon...
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
