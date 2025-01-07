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
  const [investmentType, setInvestmentType] = useState("");
  const [amount, setAmount] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [maturityDate, setMaturityDate] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState("monthly");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        source_id: sourceId,
        type: "investment",
        investment_name: investmentName,
        investment_type: investmentType,
        amount: parseFloat(amount),
        return_rate: parseFloat(returnRate),
        start_date: startDate,
        maturity_date: maturityDate,
        payment_frequency: frequency,
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
          <Select value={investmentType} onValueChange={setInvestmentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select investment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="bonds">Bonds</SelectItem>
              <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
              <SelectItem value="real_estate">Real Estate</SelectItem>
              <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Principal Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter principal amount"
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
            placeholder="Enter expected return rate"
            required
          />
        </div>

        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Maturity Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !maturityDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {maturityDate ? format(maturityDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={maturityDate}
                onSelect={(date) => date && setMaturityDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Payment Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="semi_annual">Semi-Annual</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="on_maturity">On Maturity</SelectItem>
            </SelectContent>
          </Select>
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