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

interface EmploymentIncomeFormProps {
  sourceId: string;
  onSubmit: (data: any) => Promise<void>;
}

export const EmploymentIncomeForm = ({ sourceId, onSubmit }: EmploymentIncomeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [payFrequency, setPayFrequency] = useState("monthly");
  const [department, setDepartment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        source_id: sourceId,
        type: "employment",
        employee_name: employeeName,
        position,
        salary: parseFloat(salary),
        payment_date: paymentDate,
        pay_frequency: payFrequency,
        department,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Employee Name</Label>
          <Input
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter employee name"
            required
          />
        </div>

        <div>
          <Label>Position</Label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Enter position"
            required
          />
        </div>

        <div>
          <Label>Department</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Enter department"
            required
          />
        </div>

        <div>
          <Label>Salary</Label>
          <Input
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter salary amount"
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

        <div>
          <Label>Payment Frequency</Label>
          <Select value={payFrequency} onValueChange={setPayFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
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
            Adding Employment Income...
          </>
        ) : (
          "Add Employment Income"
        )}
      </Button>
    </form>
  );
};