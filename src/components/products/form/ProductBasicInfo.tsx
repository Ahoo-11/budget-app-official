import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductBasicInfoProps {
  defaultValues?: {
    name?: string;
    price?: number;
    purchase_cost?: number;
    description?: string;
  };
  isSubmitting: boolean;
}

export const ProductBasicInfo = ({ defaultValues, isSubmitting }: ProductBasicInfoProps) => {
  return (
    <>
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          name="name"
          required
          placeholder="Product name"
          defaultValue={defaultValues?.name}
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
          defaultValue={defaultValues?.price}
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
          defaultValue={defaultValues?.purchase_cost}
          disabled={isSubmitting}
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          name="description"
          placeholder="Product description"
          defaultValue={defaultValues?.description}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};