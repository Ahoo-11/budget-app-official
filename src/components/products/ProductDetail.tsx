import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) throw error;
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

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <div className="space-y-4">
          {/* Product Image */}
          <div className="aspect-square relative rounded-lg overflow-hidden border">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Stock</div>
                <div className="text-2xl font-bold">
                  {product.current_stock || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {product.current_stock !== null && 
           product.minimum_stock_level !== null && 
           product.current_stock < product.minimum_stock_level && (
            <Card className="bg-warning/10 border-warning">
              <CardContent className="pt-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">Low stock alert</span>
              </CardContent>
            </Card>
          )}
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

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Category</dt>
                      <dd className="font-medium">{product.category || 'Uncategorized'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Type</dt>
                      <dd className="font-medium capitalize">{product.product_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Unit</dt>
                      <dd className="font-medium">{product.unit_of_measurement || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Min. Stock</dt>
                      <dd className="font-medium">{product.minimum_stock_level || 'Not set'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {product.description && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </CardContent>
                </Card>
              )}
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