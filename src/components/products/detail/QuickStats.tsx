import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  currentStock: number | null;
  price: number;
}

export const QuickStats = ({ currentStock, price }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Stock</div>
          <div className="text-2xl font-bold">
            {currentStock || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Price</div>
          <div className="text-2xl font-bold">
            MVR {price.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};