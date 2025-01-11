import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductBasicInfoProps {
  defaultValues?: Product;
  isSubmitting: boolean;
  onProductTypeChange?: (type: 'basic' | 'composite') => void;
}

export const ProductBasicInfo = ({
  defaultValues,
  isSubmitting,
  onProductTypeChange,
}: ProductBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Product Type</Label>
        <RadioGroup
          defaultValue={defaultValues?.product_type || 'basic'}
          onValueChange={(value: 'basic' | 'composite') => onProductTypeChange?.(value)}
          className="flex gap-4 mt-2"
          disabled={isSubmitting || !!defaultValues}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic" id="basic" />
            <Label htmlFor="basic">Basic Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="composite" id="composite" />
            <Label htmlFor="composite">Composite Product</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.price}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description || ""}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};