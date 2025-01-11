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
            unit_of_measurement,
            ingredient:products (
              id,
              name
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
          <p className="text-sm text-muted-foreground">
            MVR {product.price.toFixed(2)}
          </p>
        </div>

        {product.product_type === 'basic' ? (
          <div className="text-sm text-muted-foreground">
            Stock: {product.current_stock} {product.unit_of_measurement || 'units'}
          </div>
        ) : recipe && (
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-xs uppercase mt-2 mb-1">Recipe:</div>
            <ul className="list-disc list-inside">
              {recipe.recipe_ingredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.quantity} {ingredient.unit_of_measurement} {ingredient.ingredient.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};