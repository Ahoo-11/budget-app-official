import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeBuilderProps {
  sourceId: string;
  isSubmitting: boolean;
  onIngredientsChange: (ingredients: Array<{
    id: string;
    quantity: number;
    unit_of_measurement: string;
  }>) => void;
}

export const RecipeBuilder = ({
  sourceId,
  isSubmitting,
  onIngredientsChange,
}: RecipeBuilderProps) => {
  const [ingredients, setIngredients] = useState<Array<{
    id: string;
    quantity: number;
    unit_of_measurement: string;
  }>>([]);

  const { data: basicProducts = [] } = useQuery({
    queryKey: ['basic-products', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('source_id', sourceId)
        .eq('product_type', 'basic')
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const addIngredient = () => {
    if (basicProducts.length > 0) {
      const newIngredient = {
        id: basicProducts[0].id,
        quantity: 1,
        unit_of_measurement: basicProducts[0].unit_of_measurement || 'unit',
      };
      const updatedIngredients = [...ingredients, newIngredient];
      setIngredients(updatedIngredients);
      onIngredientsChange(updatedIngredients);
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    onIngredientsChange(updatedIngredients);
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const updatedIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
    onIngredientsChange(updatedIngredients);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Recipe Ingredients</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
          disabled={isSubmitting || basicProducts.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {ingredients.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No ingredients added yet
        </div>
      )}

      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Select
            value={ingredient.id}
            onValueChange={(value) => updateIngredient(index, 'id', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {basicProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={ingredient.quantity}
            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
            className="w-24"
            disabled={isSubmitting}
          />

          <Input
            value={ingredient.unit_of_measurement}
            onChange={(e) => updateIngredient(index, 'unit_of_measurement', e.target.value)}
            className="w-24"
            disabled={isSubmitting}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeIngredient(index)}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};