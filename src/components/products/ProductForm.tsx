import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { Image, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Fetch suppliers for the source
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

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
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Name</label>
          <Input
            name="name"
            required
            placeholder="Product name"
            defaultValue={product?.name}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Selling Price</label>
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            defaultValue={product?.price}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Purchase Cost</label>
          <Input
            name="purchase_cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={product?.purchase_cost}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Input
            name="category"
            placeholder="Category"
            defaultValue={product?.category}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subcategory</label>
          <Input
            name="subcategory"
            placeholder="Subcategory"
            defaultValue={product?.subcategory}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Current Stock</label>
          <Input
            name="current_stock"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            defaultValue={product?.current_stock}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Stock Level</label>
          <Input
            name="minimum_stock_level"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            defaultValue={product?.minimum_stock_level}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit of Measurement</label>
          <Input
            name="unit_of_measurement"
            placeholder="e.g., pieces, kg, liters"
            defaultValue={product?.unit_of_measurement}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Storage Location</label>
          <Input
            name="storage_location"
            placeholder="Storage location"
            defaultValue={product?.storage_location}
            disabled={isSubmitting}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Supplier</label>
          <Select name="supplier_id" defaultValue={product?.supplier_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            name="description"
            placeholder="Product description"
            defaultValue={product?.description}
            disabled={isSubmitting}
          />
        </div>
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