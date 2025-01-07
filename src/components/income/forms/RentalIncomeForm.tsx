import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RentalIncomeFormProps {
  sourceId: string;
  onSubmit: (data: any) => Promise<void>;
}

export const RentalIncomeForm = ({ sourceId, onSubmit }: RentalIncomeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [rentalAmount, setRentalAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [tenantName, setTenantName] = useState("");
  const [leaseStart, setLeaseStart] = useState<Date>(new Date());
  const [leaseEnd, setLeaseEnd] = useState<Date>(new Date());
  const [terms, setTerms] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        source_id: sourceId,
        type: "rental",
        property_name: propertyName,
        address,
        rental_amount: parseFloat(rentalAmount),
        due_date: dueDate,
        tenant_name: tenantName,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        terms,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Property Name</Label>
          <Input
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder="Enter property name"
            required
          />
        </div>

        <div>
          <Label>Address</Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter property address"
            required
          />
        </div>

        <div>
          <Label>Rental Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={rentalAmount}
            onChange={(e) => setRentalAmount(e.target.value)}
            placeholder="Enter rental amount"
            required
          />
        </div>

        <div>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setDueDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Tenant Name</Label>
          <Input
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Enter tenant name"
            required
          />
        </div>

        <div>
          <Label>Lease Period</Label>
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !leaseStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {leaseStart ? format(leaseStart, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={leaseStart}
                  onSelect={(date) => date && setLeaseStart(date)}
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
                    !leaseEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {leaseEnd ? format(leaseEnd, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={leaseEnd}
                  onSelect={(date) => date && setLeaseEnd(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Terms & Conditions</Label>
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter lease terms and conditions"
          />
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
            Adding Rental Income...
          </>
        ) : (
          "Add Rental Income"
        )}
      </Button>
    </form>
  );
};