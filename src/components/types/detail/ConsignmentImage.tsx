import { Card } from "@/components/ui/card";

interface ConsignmentImageProps {
  imageUrl: string | null;
  name: string;
}

export const ConsignmentImage = ({ imageUrl, name }: ConsignmentImageProps) => {
  return (
    <Card className="overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-[300px] object-cover"
        />
      ) : (
        <div className="w-full h-[300px] bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      )}
    </Card>
  );
};