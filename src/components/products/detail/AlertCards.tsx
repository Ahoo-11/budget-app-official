import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AlertCardsProps {
  currentStock: number | null;
  minimumStockLevel: number | null;
  isEditing?: boolean;
  onMinStockChange?: (level: number) => void;
}

export const AlertCards = ({ 
  currentStock, 
  minimumStockLevel, 
  isEditing = false,
  onMinStockChange 
}: AlertCardsProps) => {
  if (currentStock === null || minimumStockLevel === null) {
    return null;
  }

  const showAlert = currentStock < minimumStockLevel;

  return (
    <>
      {isEditing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label htmlFor="minStock" className="text-sm font-medium">
                Minimum Stock Level
              </label>
              <Input
                id="minStock"
                type="number"
                value={minimumStockLevel}
                onChange={(e) => onMinStockChange?.(Number(e.target.value))}
                min={0}
              />
            </div>
          </CardContent>
        </Card>
      ) : showAlert ? (
        <Card className="bg-warning/10 border-warning">
          <CardContent className="pt-6 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm">Low stock alert</span>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
};