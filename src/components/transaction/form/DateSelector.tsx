import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
  isSubmitting: boolean;
}

export const DateSelector = ({ date, setDate, isSubmitting }: DateSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={isSubmitting}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
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
  );
};