import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductBasicInfoProps {
  defaultValues?: Product;
  isSubmitting: boolean;
  onProductTypeChange?: (type: 'basic' | 'composite' | 'consignment') => void;
  onConsignmentPricesChange?: (supplierPrice: number, sellingPrice: number) => void;
}

export const ProductBasicInfo = ({
  defaultValues,
  isSubmitting,
  onProductTypeChange,
  onConsignmentPricesChange,
}: ProductBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Product Type</Label>
        <RadioGroup
          defaultValue={defaultValues?.product_type || 'basic'}
          onValueChange={(value: 'basic' | 'composite' | 'consignment') => onProductTypeChange?.(value)}
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="consignment" id="consignment" />
            <Label htmlFor="consignment">Consignment Product</Label>
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

      {defaultValues?.product_type === 'consignment' && (
        <>
          <div>
            <Label htmlFor="consignmentSupplierPrice">Supplier Price</Label>
            <Input
              id="consignmentSupplierPrice"
              name="consignmentSupplierPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={defaultValues?.consignment_supplier_price}
              onChange={(e) => {
                const supplierPrice = parseFloat(e.target.value);
                const sellingPrice = defaultValues?.consignment_selling_price || 0;
                onConsignmentPricesChange?.(supplierPrice, sellingPrice);
              }}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="consignmentSellingPrice">Selling Price</Label>
            <Input
              id="consignmentSellingPrice"
              name="consignmentSellingPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={defaultValues?.consignment_selling_price}
              onChange={(e) => {
                const sellingPrice = parseFloat(e.target.value);
                const supplierPrice = defaultValues?.consignment_supplier_price || 0;
                onConsignmentPricesChange?.(supplierPrice, sellingPrice);
              }}
              disabled={isSubmitting}
              required
            />
          </div>
        </>
      )}

      {defaultValues?.product_type !== 'consignment' && (
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
      )}

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