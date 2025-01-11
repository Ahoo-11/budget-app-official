import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QuickStatsProps {
  currentStock: number | null;
  price: number;
  isEditing?: boolean;
  onStockChange?: (stock: number) => void;
  onPriceChange?: (price: number) => void;
}

export const QuickStats = ({ 
  currentStock, 
  price, 
  isEditing,
  onStockChange,
  onPriceChange
}: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Stock</div>
          {isEditing ? (
            <Input
              type="number"
              value={currentStock || 0}
              onChange={(e) => onStockChange?.(Number(e.target.value))}
              className="mt-1"
            />
          ) : (
            <div className="text-2xl font-bold">
              {currentStock || 0}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Price</div>
          {isEditing ? (
            <Input
              type="number"
              value={price}
              onChange={(e) => onPriceChange?.(Number(e.target.value))}
              className="mt-1"
              step="0.01"
            />
          ) : (
            <div className="text-2xl font-bold">
              MVR {price.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};