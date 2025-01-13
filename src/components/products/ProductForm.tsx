import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";
import { ProductImageUpload } from "./form/ProductImageUpload";
import { ProductBasicInfo } from "./form/ProductBasicInfo";
import { ProductCategories } from "./form/ProductCategories";
import { ProductInventory } from "./form/ProductInventory";
import { ProductSupplier } from "./form/ProductSupplier";
import { RecipeBuilder } from "./form/RecipeBuilder";

interface ProductFormProps {
  sourceId: string;
  onSuccess?: () => void;
  product?: Product;
}

// Define the minimum required fields for a product
type RequiredProductFields = Pick<Product, 'source_id' | 'name' | 'product_type' | 'price'>;
type OptionalProductFields = Partial<Omit<Product, keyof RequiredProductFields>>;
type ProductInput = RequiredProductFields & OptionalProductFields;

export const ProductForm = ({ sourceId, onSuccess, product }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(product?.image_url || "");
  const [productType, setProductType] = useState<'basic' | 'composite' | 'consignment'>(
    product?.product_type || 'basic'
  );
  const [ingredients, setIngredients] = useState<Array<{
    id: string;
    quantity: number;
    unit_of_measurement: string;
  }>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = product?.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${sourceId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Create base product data with required fields
      const baseProductData: RequiredProductFields = {
        source_id: sourceId,
        name: formData.get('name') as string,
        product_type: productType,
        price: 0,
      };

      // Add optional fields
      const productData: ProductInput = {
        ...baseProductData,
        image_url: imageUrl,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        subcategory: formData.get('subcategory') as string,
        unit_of_measurement: formData.get('unit_of_measurement') as string,
      };

      // Handle different product types
      if (productType === 'basic') {
        productData.price = parseFloat(formData.get('price') as string);
        productData.purchase_cost = formData.get('purchase_cost') ? parseFloat(formData.get('purchase_cost') as string) : null;
        productData.minimum_stock_level = formData.get('minimum_stock_level') ? parseFloat(formData.get('minimum_stock_level') as string) : 0;
        productData.current_stock = formData.get('current_stock') ? parseFloat(formData.get('current_stock') as string) : 0;
        productData.supplier_id = formData.get('supplier_id') as string || null;
        productData.storage_location = formData.get('storage_location') as string || null;
      } else if (productType === 'consignment') {
        productData.consignment_supplier_price = parseFloat(formData.get('consignmentSupplierPrice') as string);
        productData.consignment_selling_price = parseFloat(formData.get('consignmentSellingPrice') as string);
        productData.price = productData.consignment_selling_price;
        productData.supplier_id = formData.get('supplier_id') as string;
        productData.current_stock = formData.get('current_stock') ? parseFloat(formData.get('current_stock') as string) : 0;
      }

      if (product) {
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (productError) throw productError;

        if (productType === 'composite') {
          // Update recipe
          const { data: existingRecipe } = await supabase
            .from('product_recipes')
            .select('id')
            .eq('product_id', product.id)
            .single();

          if (existingRecipe) {
            // Update existing recipe
            const { error: recipeError } = await supabase
              .from('product_recipes')
              .update({
                name: productData.name,
                description: productData.description,
              })
              .eq('id', existingRecipe.id);

            if (recipeError) throw recipeError;

            // Delete existing ingredients
            await supabase
              .from('recipe_ingredients')
              .delete()
              .eq('recipe_id', existingRecipe.id);

            // Insert new ingredients
            if (ingredients.length > 0) {
              const { error: ingredientsError } = await supabase
                .from('recipe_ingredients')
                .insert(
                  ingredients.map(ingredient => ({
                    recipe_id: existingRecipe.id,
                    ingredient_id: ingredient.id,
                    quantity: ingredient.quantity,
                    unit_of_measurement: ingredient.unit_of_measurement,
                  }))
                );

              if (ingredientsError) throw ingredientsError;
            }
          }
        }
      } else {
        // Insert new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (productError) throw productError;

        if (productType === 'composite' && ingredients.length > 0) {
          // Create recipe
          const { data: recipe, error: recipeError } = await supabase
            .from('product_recipes')
            .insert({
              product_id: newProduct.id,
              name: productData.name,
              description: productData.description,
            })
            .select()
            .single();

          if (recipeError) throw recipeError;

          // Insert ingredients
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(
              ingredients.map(ingredient => ({
                recipe_id: recipe.id,
                ingredient_id: ingredient.id,
                quantity: ingredient.quantity,
                unit_of_measurement: ingredient.unit_of_measurement,
              }))
            );

          if (ingredientsError) throw ingredientsError;
        }
      }

      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'added'} successfully`,
      });

      await queryClient.invalidateQueries({ queryKey: ['products', sourceId] });
      onSuccess?.();
    } catch (error) {
      console.error('Error handling product:', error);
      toast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductImageUpload
        previewUrl={previewUrl}
        onImageChange={handleImageChange}
        isSubmitting={isSubmitting}
      />

      <ProductBasicInfo
        defaultValues={product}
        isSubmitting={isSubmitting}
        onProductTypeChange={setProductType}
      />

      {productType === 'basic' && (
        <>
          <ProductCategories
            defaultValues={product}
            isSubmitting={isSubmitting}
          />

          <ProductInventory
            defaultValues={product}
            isSubmitting={isSubmitting}
          />

          <ProductSupplier
            defaultValue={product?.supplier_id}
            isSubmitting={isSubmitting}
          />
        </>
      )}

      {productType === 'consignment' && (
        <ProductSupplier
          defaultValue={product?.supplier_id}
          isSubmitting={isSubmitting}
          required
        />
      )}

      {productType === 'composite' && (
        <RecipeBuilder
          sourceId={sourceId}
          isSubmitting={isSubmitting}
          onIngredientsChange={setIngredients}
        />
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {product ? "Updating..." : "Adding..."}
          </>
        ) : (
          product ? "Update Product" : "Add Product"
        )}
      </Button>
    </form>
  );
};