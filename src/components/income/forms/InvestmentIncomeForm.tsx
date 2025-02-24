import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvestmentIncomeFormProps {
  sourceId: string;
  onSubmit: (data: any) => Promise<void>;
}

export const InvestmentIncomeForm = ({ sourceId, onSubmit }: InvestmentIncomeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investmentName, setInvestmentName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("dividend");
  const [date, setDate] = useState<Date>(new Date());
  const [returnRate, setReturnRate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        source_id: sourceId,
        type: "investment",
        investment_name: investmentName,
        amount: parseFloat(amount),
        investment_type: type,
        date: date,
        return_rate: parseFloat(returnRate),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Investment Name</Label>
          <Input
            value={investmentName}
            onChange={(e) => setInvestmentName(e.target.value)}
            placeholder="Enter investment name"
            required
          />
        </div>

        <div>
          <Label>Investment Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select investment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dividend">Dividend</SelectItem>
              <SelectItem value="interest">Interest</SelectItem>
              <SelectItem value="capital_gain">Capital Gain</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>

        <div>
          <Label>Return Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
            placeholder="Enter return rate"
            required
          />
        </div>

        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
            Adding Investment Income...
          </>
        ) : (
          "Add Investment Income"
        )}
      </Button>
    </form>
  );
};