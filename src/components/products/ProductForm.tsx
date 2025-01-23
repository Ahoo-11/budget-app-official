import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";
import { ProductImageUpload } from "./form/ProductImageUpload";
import { ProductBasicInfo } from "./form/ProductBasicInfo";
import { RecipeBuilder } from "./form/RecipeBuilder";
import { ProductCategories } from "./form/ProductCategories";

interface ProductFormProps {
  sourceId: string;
  onSuccess?: () => void;
  product?: Product;
}

type RequiredProductFields = Pick<Product, 'source_id' | 'name' | 'product_type'>;
type OptionalProductFields = Partial<Omit<Product, keyof RequiredProductFields>>;
type ProductInput = RequiredProductFields & OptionalProductFields;

export const ProductForm = ({ sourceId, onSuccess, product }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(product?.image_url || "");
  const [productType, setProductType] = useState<'basic' | 'composite'>(
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

      // Upload image if changed
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(`${sourceId}/${Date.now()}-${imageFile.name}`, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      // Prepare product data
      const productData: ProductInput = {
        source_id: sourceId,
        name: formData.get("name") as string,
        product_type: productType,
        description: formData.get("description") as string || null,
        measurement_unit_id: formData.get("measurement_unit_id") as string || null,
        // Only include content fields for basic products
        ...(productType === 'basic' ? {
          content_unit_id: formData.get("content_unit_id") as string || null,
          content_per_unit: (() => {
            const value = formData.get("content_per_unit") as string;
            return value ? parseFloat(value) : null;
          })(),
        } : {
          content_unit_id: null,
          content_per_unit: null
        }),
        // Set price to 0 if not provided or invalid
        price: (() => {
          const priceStr = formData.get("price") as string;
          if (priceStr && priceStr.trim() !== '') {
            const price = parseFloat(priceStr);
            return !isNaN(price) ? price : 0;
          }
          return 0;
        })()
      };

      if (imageUrl) {
        productData.image_url = imageUrl;
      }

      let result;
      if (product) {
        // Update existing product
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Product updated",
          description: "Product has been updated successfully.",
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Product created",
          description: "Product has been created successfully.",
        });
      }

      // Invalidate queries
      await queryClient.invalidateQueries(["products"]);
      await queryClient.invalidateQueries(["product", result.id]);

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error saving product",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ProductImageUpload
        previewUrl={previewUrl}
        onImageChange={handleImageChange}
        isSubmitting={isSubmitting}
        disabled={isSubmitting}
      />

      <ProductBasicInfo
        defaultValues={product}
        isSubmitting={isSubmitting}
        onProductTypeChange={setProductType}
      />

      <ProductCategories
        defaultValues={product}
        isSubmitting={isSubmitting}
        sourceId={sourceId}
      />

      {productType === "composite" && (
        <RecipeBuilder
          sourceId={sourceId}
          defaultIngredients={ingredients}
          onChange={setIngredients}
          disabled={isSubmitting}
        />
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};