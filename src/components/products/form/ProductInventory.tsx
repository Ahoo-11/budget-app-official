import { Input } from "@/components/ui/input";

interface ProductInventoryProps {
  defaultValues?: {
    current_stock?: number;
    minimum_stock_level?: number;
    unit_of_measurement?: string;
    storage_location?: string;
  };
  isSubmitting: boolean;
}

export const ProductInventory = ({ defaultValues, isSubmitting }: ProductInventoryProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Current Stock</label>
        <Input
          name="current_stock"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          defaultValue={defaultValues?.current_stock}
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
          defaultValue={defaultValues?.minimum_stock_level}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Unit of Measurement</label>
        <Input
          name="unit_of_measurement"
          placeholder="e.g., pieces, kg, liters"
          defaultValue={defaultValues?.unit_of_measurement}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Storage Location</label>
        <Input
          name="storage_location"
          placeholder="Storage location"
          defaultValue={defaultValues?.storage_location}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};