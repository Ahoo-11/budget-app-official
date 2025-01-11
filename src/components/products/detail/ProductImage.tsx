import { Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageProps {
  imageUrl?: string;
  name: string;
  isEditing?: boolean;
  onImageChange?: (file: File) => void;
}

export const ProductImage = ({ imageUrl, name, isEditing, onImageChange }: ProductImageProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className="aspect-square relative rounded-lg overflow-hidden border group">
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
      
      {isEditing && (
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <Upload className="h-4 w-4" />
              Upload Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};