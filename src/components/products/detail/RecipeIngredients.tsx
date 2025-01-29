import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface RecipeIngredientsProps {
  product: Product;
  isEditing: boolean;
  onIngredientsChange?: (ingredients: Array<{
    id: string;
    content_quantity: number;
  }>) => void;
}

export const RecipeIngredients = ({ product, isEditing, onIngredientsChange }: RecipeIngredientsProps) => {
  const { data: basicProducts = [] } = useQuery({
    queryKey: ['basic-products', product.source_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          measurement_unit:measurement_units!measurement_unit_id (
            id,
            name,
            symbol
          ),
          content_unit:measurement_units!content_unit_id (
            id,
            name,
            symbol
          )
        `)
        .eq('source_id', product.source_id)
        .eq('product_type', 'basic')
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const addIngredient = () => {
    if (!isEditing || !basicProducts.length || !onIngredientsChange) return;

    const currentIngredients = product.recipe_ingredients || [];
    const newIngredient = {
      ingredient_id: basicProducts[0].id,
      content_quantity: 0,
    };
    
    onIngredientsChange([...currentIngredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    if (!isEditing || !onIngredientsChange) return;

    const currentIngredients = product.recipe_ingredients || [];
    const updatedIngredients = currentIngredients.filter((_, i) => i !== index);
    onIngredientsChange(updatedIngredients);
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    if (!isEditing || !onIngredientsChange) return;

    const currentIngredients = product.recipe_ingredients || [];
    const updatedIngredients = currentIngredients.map((ingredient, i) => {
      if (i === index) {
        if (field === 'ingredient_id') {
          // When changing ingredient, get its measurement units
          const selectedProduct = basicProducts.find(p => p.id === value);
          return {
            ...ingredient,
            ingredient_id: value,
            purchase_unit_id: selectedProduct?.measurement_unit?.id,
            sales_unit_id: selectedProduct?.content_unit?.id
          };
        }
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    onIngredientsChange(updatedIngredients);
  };

  if (!product.recipe_ingredients?.length && !isEditing) {
    return <dd className="text-sm">No ingredients added</dd>;
  }

  return (
    <div className="space-y-4 mt-2">
      {(product.recipe_ingredients || []).map((ingredient, index) => {
        const basicProduct = ingredient.ingredient;
        return (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Select
                  value={ingredient.ingredient_id}
                  onValueChange={(value) => updateIngredient(index, 'ingredient_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {basicProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.current_stock} {product.measurement_unit?.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm font-medium">
                  {basicProduct?.name || 'Unknown product'} ({basicProduct?.current_stock} {basicProduct?.measurement_unit?.symbol} in stock)
                </span>
              )}
            </div>
            <div className="w-32">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={ingredient.content_quantity}
                    onChange={(e) => updateIngredient(index, 'content_quantity', parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {basicProduct?.content_unit?.symbol}
                  </span>
                </div>
              ) : (
                <span className="text-sm">
                  {ingredient.content_quantity} {basicProduct?.content_unit?.symbol}
                </span>
              )}
            </div>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
      {isEditing && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
          disabled={basicProducts.length === 0}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      )}
    </div>
  );
};
