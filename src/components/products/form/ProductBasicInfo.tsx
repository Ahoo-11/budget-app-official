import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [productType, setProductType] = useState<'basic' | 'composite'>(
    defaultValues?.product_type || 'basic'
  );

  const { data: measurementUnits = [] } = useQuery({
    queryKey: ['measurement-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurement_units')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleProductTypeChange = (type: 'basic' | 'composite') => {
    setProductType(type);
    onProductTypeChange?.(type);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Type</Label>
        <RadioGroup
          name="product_type"
          defaultValue={productType}
          onValueChange={(value: 'basic' | 'composite') => handleProductTypeChange(value)}
          className="flex gap-4"
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
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="price">Price (Optional)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.price}
          placeholder="Enter price (can be set later)"
          disabled={isSubmitting}
        />
        <p className="text-sm text-muted-foreground mt-1">
          You can set or update the price later
        </p>
      </div>

      {/* Container Unit - Always shown */}
      <div className="space-y-2">
        <Label>Container Unit</Label>
        <Select
          name="measurement_unit_id"
          defaultValue={defaultValues?.measurement_unit_id || ""}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select container unit" />
          </SelectTrigger>
          <SelectContent>
            {measurementUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {productType === 'basic' 
            ? "How do you count this product in stock? (e.g., tins, boxes)" 
            : "What unit will this product be sold in? (e.g., servings, pieces)"}
        </p>
      </div>

      {/* Content Unit and Amount - Only for basic products */}
      {productType === 'basic' && (
        <div className="space-y-4 border-t pt-4">
          <Label className="block text-sm font-medium mb-2">Content Information</Label>
          
          <div className="space-y-2">
            <Label>Content Unit</Label>
            <Select
              name="content_unit_id"
              defaultValue={defaultValues?.content_unit_id || ""}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content unit" />
              </SelectTrigger>
              <SelectContent>
                {measurementUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              What unit is used to measure the content? (e.g., grams, milliliters)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Content per Container</Label>
            <Input
              name="content_per_unit"
              type="number"
              min="0.001"
              step="0.001"
              defaultValue={defaultValues?.content_per_unit}
              placeholder="e.g., 220 for 220g per tin"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              How much content is in one container? (e.g., 220 grams per tin)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};