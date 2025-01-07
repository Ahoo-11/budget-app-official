import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoyaltyIncomeFormProps {
  sourceId: string;
  onSubmit: (data: any) => Promise<void>;
}

export const RoyaltyIncomeForm = ({ sourceId, onSubmit }: RoyaltyIncomeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [royaltyRate, setRoyaltyRate] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [contractStart, setContractStart] = useState<Date>(new Date());
  const [contractEnd, setContractEnd] = useState<Date>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        source_id: sourceId,
        type: "royalty",
        asset_name: assetName,
        royalty_rate: parseFloat(royaltyRate),
        payment_date: paymentDate,
        is_recurring: isRecurring,
        frequency,
        contract_start: contractStart,
        contract_end: contractEnd,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Asset Name</Label>
          <Input
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Enter asset name"
            required
          />
        </div>

        <div>
          <Label>Royalty Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={royaltyRate}
            onChange={(e) => setRoyaltyRate(e.target.value)}
            placeholder="Enter royalty rate"
            required
          />
        </div>

        <div>
          <Label>Payment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !paymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={paymentDate}
                onSelect={(date) => date && setPaymentDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="recurring">Recurring Payment</Label>
        </div>

        {isRecurring && (
          <div>
            <Label>Payment Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Contract Period</Label>
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !contractStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {contractStart ? format(contractStart, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={contractStart}
                  onSelect={(date) => date && setContractStart(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !contractEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {contractEnd ? format(contractEnd, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={contractEnd}
                  onSelect={(date) => date && setContractEnd(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Royalty Income...
          </>
        ) : (
          "Add Royalty Income"
        )}
      </Button>
    </form>
  );
};