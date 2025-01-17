import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConsignmentAlertCardsProps {
  consignment: {
    current_stock: number | null;
    minimum_stock_level: number | null;
    suppliers?: {
      name: string;
    } | null;
    supplier_settlement_terms?: {
      settlement_frequency: string;
      payment_terms: number;
    } | null;
  };
}

export const ConsignmentAlertCards = ({ consignment }: ConsignmentAlertCardsProps) => {
  const stockStatus = 
    !consignment.current_stock ? "out" :
    consignment.current_stock <= (consignment.minimum_stock_level || 0) ? "low" :
    "good";

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
          <Badge variant={
            stockStatus === "out" ? "destructive" :
            stockStatus === "low" ? "warning" :
            "outline"
          }>
            {stockStatus === "out" ? "Out of Stock" :
             stockStatus === "low" ? "Low Stock" :
             "In Stock"}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Minimum level: {consignment.minimum_stock_level || 0} units
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{consignment.suppliers?.name}</p>
          {consignment.supplier_settlement_terms && (
            <p className="text-sm text-muted-foreground">
              Settlement: Every {consignment.supplier_settlement_terms.settlement_frequency} |
              Payment Terms: {consignment.supplier_settlement_terms.payment_terms} days
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};