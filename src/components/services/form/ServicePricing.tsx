import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServicePricingProps {
  price: string;
  setPrice: (value: string) => void;
  measurementUnitId: string;
  setMeasurementUnitId: (value: string) => void;
  measurementUnits: Array<{ id: string; name: string; symbol: string }>;
}

export const ServicePricing = ({
  price,
  setPrice,
  measurementUnitId,
  setMeasurementUnitId,
  measurementUnits,
}: ServicePricingProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Price (MVR)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          placeholder="0.00"
        />
      </div>

      <div>
        <Label>Measurement Unit</Label>
        <Select value={measurementUnitId} onValueChange={setMeasurementUnitId}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {measurementUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
