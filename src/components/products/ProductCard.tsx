import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Image } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onEdit?: () => void;
}

export const ProductCard = ({ product, onClick, onEdit }: ProductCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const profitMargin = product.purchase_cost 
    ? ((product.price - product.purchase_cost) / product.price * 100).toFixed(1)
    : null;

  return (
    <Card 
      className={`overflow-hidden h-full hover:shadow-md transition-shadow relative group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {onEdit && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {product.current_stock !== undefined && product.minimum_stock_level !== undefined && 
          product.current_stock <= product.minimum_stock_level && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground truncate">
              {product.category}
              {product.subcategory && ` › ${product.subcategory}`}
            </p>
            {product.current_stock !== undefined && (
              <p className="text-xs text-muted-foreground">
                Stock: {product.current_stock} {product.unit_of_measurement || 'units'}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">MVR {product.price.toFixed(2)}</p>
            {profitMargin && (
              <p className="text-xs text-muted-foreground">
                Margin: {profitMargin}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};