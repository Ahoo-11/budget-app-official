import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCategories } from "../../form/ProductCategories";
import { RecipeIngredients } from "../RecipeIngredients";

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
                <ProductCategories
                  defaultValues={{
                    category: editedProduct?.category,
                    subcategory: editedProduct?.subcategory
                  }}
                  isSubmitting={false}
                  sourceId={product.source_id}
                  onChange={(values) => {
                    onProductChange?.({
                      ...editedProduct,
                      category: values.category,
                      subcategory: values.subcategory
                    });
                  }}
                />
              ) : (
                <dd className="text-sm font-medium">
                  {product.category || "Uncategorized"}
                  {product.subcategory && ` > ${product.subcategory}`}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{product.product_type}</dd>
            </div>

            {/* Container Unit */}
            <div>
              <dt className="text-sm text-muted-foreground">Container Unit</dt>
              {isEditing ? (
                <Select 
                  value={editedProduct?.measurement_unit_id || ''} 
                  onValueChange={(value) => onProductChange?.({ ...editedProduct, measurement_unit_id: value })}
                >
                  <SelectTrigger className="mt-1">
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
              ) : (
                <dd className="font-medium">
                  {product.measurement_unit ? 
                    `${product.measurement_unit.name} (${product.measurement_unit.symbol})` : 
                    'Not specified'
                  }
                </dd>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {product.product_type === 'basic' 
                  ? "How do you count this product in stock? (e.g., tins, boxes)" 
                  : "What unit will this product be sold in? (e.g., servings, pieces)"}
              </p>
            </div>

            {/* Content Unit - Only for basic products */}
            {product.product_type === 'basic' && (
              <div>
                <dt className="text-sm text-muted-foreground">Content Unit</dt>
                {isEditing ? (
                  <div className="space-y-2">
                    <Select 
                      value={editedProduct?.content_unit_id || ''} 
                      onValueChange={(value) => onProductChange?.({ ...editedProduct, content_unit_id: value })}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Input
                      type="number"
                      value={editedProduct?.content_per_unit || ''}
                      onChange={(e) => onProductChange?.({ ...editedProduct, content_per_unit: parseFloat(e.target.value) })}
                      placeholder="Amount per container"
                      min="0.001"
                      step="0.001"
                    />
                  </div>
                ) : (
                  <dd className="font-medium">
                    {product.content_unit && product.content_per_unit ? 
                      `${product.content_per_unit} ${product.content_unit.symbol} per ${product.measurement_unit?.symbol}` : 
                      'Not specified'
                    }
                  </dd>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  What unit is used to measure the content? (e.g., grams, milliliters)
                </p>
              </div>
            )}

            {/* Recipe Ingredients - Only for composite products */}
            {product.product_type === 'composite' && (
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">Recipe Ingredients</dt>
                <RecipeIngredients
                  product={product}
                  isEditing={isEditing}
                  onIngredientsChange={(ingredients) => {
                    onProductChange?.({
                      ...editedProduct,
                      recipe_ingredients: ingredients
                    });
                  }}
                />
              </div>
            )}

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