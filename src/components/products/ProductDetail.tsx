import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          source_id,
          measurement_unit:measurement_units!measurement_unit_id(
            id,
            name,
            symbol
          ),
          content_unit:measurement_units!content_unit_id(
            id,
            name,
            symbol
          ),
          recipe_ingredients(
            id,
            content_quantity,
            purchase_unit:measurement_units!purchase_unit_id(
              id,
              name,
              symbol
            ),
            sales_unit:measurement_units!sales_unit_id(
              id,
              name,
              symbol
            ),
            ingredient:products!recipe_ingredients_ingredient_id_fkey(
              id,
              name,
              current_stock,
              measurement_unit:measurement_units!measurement_unit_id(
                id,
                name,
                symbol
              ),
              content_unit:measurement_units!content_unit_id(
                id,
                name,
                symbol
              )
            )
          )
        `)
        .eq('id', productId)
        .maybeSingle();

      if (error) {
        console.error('Error loading product:', error);
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

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: Partial<Product>) => {
      // Remove nested objects and computed fields
      const { measurement_unit, content_unit, recipe_ingredients, created_at, updated_at, ...updateData } = updatedProduct;

      // Update product details
      const { error: productError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);
      
      if (productError) throw productError;

      // If recipe ingredients were changed and it's a composite product
      if (recipe_ingredients && product.product_type === 'composite') {
        // Delete existing ingredients
        const { error: deleteError } = await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('product_id', product.id);
        
        if (deleteError) throw deleteError;
        
        // Insert new ingredients if any
        if (recipe_ingredients.length > 0) {
          const { error: insertError } = await supabase
            .from('recipe_ingredients')
            .insert(
              recipe_ingredients.map(ing => ({
                product_id: product.id,
                ingredient_id: ing.id,
                content_quantity: ing.content_quantity
              }))
            );
          
          if (insertError) throw insertError;
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['product', productId]);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating product",
        description: error.message || "Failed to update product",
      });
    },
  });

  const handleEditClick = () => {
    setEditedProduct(product || {});
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (!editedProduct) return;
    updateProductMutation.mutate(editedProduct);
  };

  const handleCancelClick = () => {
    setEditedProduct({});
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Upload image to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(`${product.source_id}/${Date.now()}-${file.name}`, file);

      if (uploadError) {
        throw uploadError;
      }

      if (uploadData) {
        // Get public URL for the uploaded image
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(uploadData.path);

        // Update the editedProduct state with the new image URL
        setEditedProduct(prev => ({ ...prev, image_url: publicUrl }));

        // Show success message
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message || "Failed to upload image",
      });
    }
  };

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
      <ProductHeader 
        name={product.name}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
        editedName={editedProduct.name}
        onNameChange={(name) => setEditedProduct(prev => ({ ...prev, name }))}
      />

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        <div className="space-y-4">
          <ProductImage 
            imageUrl={editedProduct.image_url || product.image_url} 
            name={product.name}
            isEditing={isEditing}
            onImageChange={handleImageUpload}
          />
          <QuickStats 
            product={product}
            isEditing={isEditing}
            editedProduct={editedProduct}
            onStockChange={(stock) => setEditedProduct(prev => ({ ...prev, current_stock: stock }))}
            onPriceChange={(price) => setEditedProduct(prev => ({ ...prev, price }))}
          />
          <AlertCards 
            currentStock={product.current_stock} 
            minimumStockLevel={product.minimum_stock_level}
            isEditing={isEditing}
            onMinStockChange={(level) => setEditedProduct(prev => ({ ...prev, minimum_stock_level: level }))}
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
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab 
                product={product}
                isEditing={isEditing}
                editedProduct={editedProduct}
                onProductChange={setEditedProduct}
              />
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};