import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecurringTransactionFieldsProps {
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurringFrequency: string;
  setRecurringFrequency: (frequency: string) => void;
  isSubmitting: boolean;
}

export const RecurringTransactionFields = ({
  isRecurring,
  setIsRecurring,
  recurringFrequency,
  setRecurringFrequency,
  isSubmitting,
}: RecurringTransactionFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="recurring">Recurring Transaction</Label>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
          disabled={isSubmitting}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={recurringFrequency}
            onValueChange={setRecurringFrequency}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};