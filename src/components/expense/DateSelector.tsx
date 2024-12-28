import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector = ({ date, onDateChange }: DateSelectorProps) => {
  return (
    <div>
      <Label>Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};