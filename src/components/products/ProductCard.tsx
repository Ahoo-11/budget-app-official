import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
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
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-muted-foreground truncate">{product.category}</p>
          <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
};