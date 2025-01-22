import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  className?: string;
}

export const ProductCard = ({ product, onClick, className }: ProductCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-accent transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="aspect-square relative mb-2">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            MVR {product.price.toFixed(2)}
          </p>
          {product.current_stock !== undefined && (
            <p className="text-xs text-muted-foreground">
              Stock: {product.current_stock}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
