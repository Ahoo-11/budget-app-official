import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const { data: recipe } = useQuery({
    queryKey: ['product-recipe', product.id],
    queryFn: async () => {
      if (product.product_type !== 'composite') return null;

      const { data: recipeData, error: recipeError } = await supabase
        .from('product_recipes')
        .select(`
          id,
          name,
          description,
          recipe_ingredients (
            id,
            quantity,
            conversion_ratio,
            purchase_unit:measurement_units!purchase_unit_id (
              id,
              name,
              symbol
            ),
            sales_unit:measurement_units!sales_unit_id (
              id,
              name,
              symbol
            ),
            ingredient:products (
              id,
              name,
              current_stock,
              measurement_unit:measurement_units (
                id,
                name,
                symbol
              ),
              content_per_unit,
              content_unit:measurement_units (
                id,
                name,
                symbol
              )
            )
          )
        `)
        .eq('product_id', product.id)
        .maybeSingle();

      if (recipeError) throw recipeError;
      return recipeData;
    },
    enabled: product.product_type === 'composite'
  });

  const { data: availableQuantity } = useQuery({
    queryKey: ['product-available-quantity', product.id],
    queryFn: async () => {
      if (product.product_type !== 'composite') return null;

      const { data, error } = await supabase
        .rpc('calculate_available_quantity', { product_id: product.id });

      if (error) throw error;
      return data;
    },
    enabled: product.product_type === 'composite'
  });

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/source/${product.source_id}/types/products/${product.id}`);
    }
  };

  return (
    <Card
      className="relative overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {product.image_url && (
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-medium">{product.name}</h3>
          {product.price && (
            <p className="text-sm text-muted-foreground">
              MVR {product.price.toFixed(2)}
            </p>
          )}
        </div>

        {product.product_type === 'basic' ? (
          <div className="text-sm text-muted-foreground">
            <div>Stock: {product.current_stock} {product.measurement_unit?.symbol || 'units'}</div>
            <div className="text-xs">
              ({product.content_per_unit} {product.content_unit?.symbol} per {product.measurement_unit?.symbol})
            </div>
            <div className="text-xs">
              Total: {(product.current_stock || 0) * (product.content_per_unit || 0)} {product.content_unit?.symbol}
            </div>
          </div>
        ) : recipe && (
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <div className="font-medium text-xs uppercase mt-2 mb-1">Recipe:</div>
              {availableQuantity !== null && (
                <div className="text-xs">
                  Available: {availableQuantity} {product.measurement_unit?.symbol || 'units'}
                </div>
              )}
            </div>
            <ul className="list-disc list-inside">
              {recipe.recipe_ingredients.map((ingredient) => {
                const basicProduct = ingredient.ingredient;
                const requiredUnits = Math.ceil(
                  ingredient.content_quantity / (basicProduct.content_per_unit || 1)
                );
                
                return (
                  <li key={ingredient.id} className="flex flex-col">
                    <span>
                      {ingredient.content_quantity} {basicProduct.content_unit?.symbol} {basicProduct.name}
                    </span>
                    <span className="text-xs ml-5 text-muted-foreground">
                      (uses {requiredUnits} {basicProduct.measurement_unit?.symbol})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};