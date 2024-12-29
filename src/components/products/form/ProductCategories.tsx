import { Input } from "@/components/ui/input";

interface ProductCategoriesProps {
  defaultValues?: {
    category?: string;
    subcategory?: string;
  };
  isSubmitting: boolean;
}

export const ProductCategories = ({ defaultValues, isSubmitting }: ProductCategoriesProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Input
          name="category"
          placeholder="Category"
          defaultValue={defaultValues?.category}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subcategory</label>
        <Input
          name="subcategory"
          placeholder="Subcategory"
          defaultValue={defaultValues?.subcategory}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};