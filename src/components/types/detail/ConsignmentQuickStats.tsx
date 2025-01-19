import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ConsignmentQuickStatsProps {
  consignment: {
    current_stock: number | null;
    unit_cost: number;
    selling_price: number;
    unit_of_measurement: string | null;
  };
  isEditing?: boolean;
  onStockChange?: (stock: number) => void;
  onUnitCostChange?: (cost: number) => void;
  onSellingPriceChange?: (price: number) => void;
  editedStock?: number | null;
  editedUnitCost?: number;
  editedSellingPrice?: number;
}

export const ConsignmentQuickStats = ({ 
  consignment,
  isEditing,
  onStockChange,
  onUnitCostChange,
  onSellingPriceChange,
  editedStock,
  editedUnitCost,
  editedSellingPrice
}: ConsignmentQuickStatsProps) => {
  const displayStock = isEditing ? editedStock : consignment.current_stock;
  const displayUnitCost = isEditing ? editedUnitCost : consignment.unit_cost;
  const displaySellingPrice = isEditing ? editedSellingPrice : consignment.selling_price;
  const margin = displaySellingPrice - displayUnitCost;
  const marginPercentage = (margin / displayUnitCost) * 100;

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
              {displayStock || 0} {consignment.unit_of_measurement || 'units'}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Margin</div>
          <div className="text-2xl font-bold">
            {marginPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            MVR {margin.toFixed(2)} per unit
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Unit Cost</div>
          {isEditing ? (
            <Input
              type="number"
              value={displayUnitCost}
              onChange={(e) => onUnitCostChange?.(Number(e.target.value))}
              className="mt-1"
              step="0.01"
              min={0}
            />
          ) : (
            <div className="text-2xl font-bold">
              MVR {displayUnitCost.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Selling Price</div>
          {isEditing ? (
            <Input
              type="number"
              value={displaySellingPrice}
              onChange={(e) => onSellingPriceChange?.(Number(e.target.value))}
              className="mt-1"
              step="0.01"
              min={0}
            />
          ) : (
            <div className="text-2xl font-bold">
              MVR {displaySellingPrice.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};