import { Image } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductImageUploadProps {
  previewUrl: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

export const ProductImageUpload = ({ previewUrl, onImageChange, isSubmitting }: ProductImageUploadProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Product preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <Input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="w-full"
        disabled={isSubmitting}
      />
    </div>
  );
};