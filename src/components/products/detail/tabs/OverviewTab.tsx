import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OverviewTabProps {
  product: Product;
  isEditing?: boolean;
  editedProduct?: Partial<Product>;
  onProductChange?: (product: Partial<Product>) => void;
}

export const OverviewTab = ({ product, isEditing, editedProduct, onProductChange }: OverviewTabProps) => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Category</dt>
              {isEditing ? (
                <Input
                  value={editedProduct?.category || ''}
                  onChange={(e) => onProductChange?.({ ...editedProduct, category: e.target.value })}
                  className="mt-1"
                  placeholder="Category"
                />
              ) : (
                <dd className="font-medium">{product.category || 'Uncategorized'}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{product.product_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Measurement Unit</dt>
              {isEditing ? (
                <Select 
                  value={editedProduct?.measurement_unit_id || ''} 
                  onValueChange={(value) => onProductChange?.({ ...editedProduct, measurement_unit_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <dd className="font-medium">
                  {product.measurement_unit ? 
                    `${product.measurement_unit.name} (${product.measurement_unit.symbol})` : 
                    'Not specified'
                  }
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Min. Stock</dt>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProduct?.min_stock || ''}
                  onChange={(e) => onProductChange?.({ ...editedProduct, min_stock: parseInt(e.target.value) })}
                  className="mt-1"
                  placeholder="Minimum stock level"
                />
              ) : (
                <dd className="font-medium">{product.min_stock || 'Not set'}</dd>
              )}
            </div>
          </dl>
        </CardContent>
      </Card>

      {product.description && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Remarks</h3>
            {isEditing ? (
              <Input
                value={editedProduct?.description || ''}
                onChange={(e) => onProductChange?.({ ...editedProduct, description: e.target.value })}
                className="mt-1"
                placeholder="Remarks"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};