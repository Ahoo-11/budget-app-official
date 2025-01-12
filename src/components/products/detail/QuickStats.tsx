import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QuickStatsProps {
  currentStock: number | null;
  price: number;
  isEditing?: boolean;
  onStockChange?: (stock: number) => void;
  onPriceChange?: (price: number) => void;
  editedStock?: number | null;
  editedPrice?: number;
}

export const QuickStats = ({ 
  currentStock, 
  price, 
  isEditing,
  onStockChange,
  onPriceChange,
  editedStock,
  editedPrice
}: QuickStatsProps) => {
  const displayStock = isEditing ? editedStock : currentStock;
  const displayPrice = isEditing ? editedPrice : price;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Stock</div>
          {isEditing ? (
            <Input
              type="number"
              value={displayStock || 0}
              onChange={(e) => onStockChange?.(Number(e.target.value))}
              className="mt-1"
              min={0}
            />
          ) : (
            <div className="text-2xl font-bold">
              {displayStock || 0}
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
              value={displayPrice}
              onChange={(e) => onPriceChange?.(Number(e.target.value))}
              className="mt-1"
              step="0.01"
              min={0}
            />
          ) : (
            <div className="text-2xl font-bold">
              MVR {displayPrice.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};