import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export const ProductCard = ({ product, onClick, onEdit }: ProductCardProps) => {
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
        .single();

      if (recipeError) throw recipeError;
      return recipeData;
    },
    enabled: product.product_type === 'composite'
  });

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/source/${product.source_id}/products/${product.id}`);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden group ${
        onClick || !onEdit ? "cursor-pointer" : ""
      }`}
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
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              MVR {product.price.toFixed(2)}
            </p>
          </div>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
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