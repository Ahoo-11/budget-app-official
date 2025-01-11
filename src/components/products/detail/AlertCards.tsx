import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AlertCardsProps {
  currentStock: number | null;
  minimumStockLevel: number | null;
}

export const AlertCards = ({ currentStock, minimumStockLevel }: AlertCardsProps) => {
  if (currentStock === null || minimumStockLevel === null || currentStock >= minimumStockLevel) {
    return null;
  }

  return (
    <Card className="bg-warning/10 border-warning">
      <CardContent className="pt-6 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-sm">Low stock alert</span>
      </CardContent>
    </Card>
  );
};