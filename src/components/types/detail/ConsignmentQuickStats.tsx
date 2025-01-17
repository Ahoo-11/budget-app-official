import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsignmentQuickStatsProps {
  consignment: {
    current_stock: number | null;
    unit_cost: number;
    selling_price: number;
    unit_of_measurement: string | null;
  };
}

export const ConsignmentQuickStats = ({ consignment }: ConsignmentQuickStatsProps) => {
  const margin = consignment.selling_price - consignment.unit_cost;
  const marginPercentage = (margin / consignment.unit_cost) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {consignment.current_stock || 0} {consignment.unit_of_measurement || 'units'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {marginPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            ₱{margin.toFixed(2)} per unit
          </p>
        </CardContent>
      </Card>
    </div>
  );
};