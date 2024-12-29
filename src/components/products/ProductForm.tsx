import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";
import { ProductImageUpload } from "./form/ProductImageUpload";
import { ProductBasicInfo } from "./form/ProductBasicInfo";
import { ProductCategories } from "./form/ProductCategories";
import { ProductInventory } from "./form/ProductInventory";
import { ProductSupplier } from "./form/ProductSupplier";

interface ProductFormProps {
  sourceId: string;
  onSuccess?: () => void;
  product?: Product;
}

export const ProductForm = ({ sourceId, onSuccess, product }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(product?.image_url || "");
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

      const productData = {
        source_id: sourceId,
        name: formData.get('name') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        subcategory: formData.get('subcategory') as string,
        description: formData.get('description') as string,
        image_url: imageUrl,
        purchase_cost: formData.get('purchase_cost') ? parseFloat(formData.get('purchase_cost') as string) : null,
        minimum_stock_level: formData.get('minimum_stock_level') ? parseFloat(formData.get('minimum_stock_level') as string) : 0,
        current_stock: formData.get('current_stock') ? parseFloat(formData.get('current_stock') as string) : 0,
        supplier_id: formData.get('supplier_id') as string || null,
        storage_location: formData.get('storage_location') as string || null,
        unit_of_measurement: formData.get('unit_of_measurement') as string || null,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
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

      <div className="grid grid-cols-2 gap-4">
        <ProductBasicInfo
          defaultValues={product}
          isSubmitting={isSubmitting}
        />

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
      </div>

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