import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Consignment {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  price: number;
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  image_url?: string;
}

interface ConsignmentCardProps {
  consignment: Consignment;
  onClick?: () => void;
}

export const ConsignmentCard = ({ consignment, onClick }: ConsignmentCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="aspect-square relative rounded-lg overflow-hidden mb-4 bg-muted">
          {consignment.image_url ? (
            <img
              src={consignment.image_url}
              alt={consignment.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium leading-none">{consignment.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(consignment.price)}
          </p>
          {consignment.measurement_unit && (
            <p className="text-xs text-muted-foreground">
              Per {consignment.measurement_unit.symbol}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
