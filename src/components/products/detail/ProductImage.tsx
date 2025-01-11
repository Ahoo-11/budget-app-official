import { Package } from "lucide-react";

interface ProductImageProps {
  imageUrl?: string;
  name: string;
}

export const ProductImage = ({ imageUrl, name }: ProductImageProps) => {
  return (
    <div className="aspect-square relative rounded-lg overflow-hidden border">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};