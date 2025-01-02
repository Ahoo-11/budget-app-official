import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { PayerSelector } from "../../PayerSelector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface CartHeaderProps {
  selectedPayerId: string;
  date: Date;
  onPayerSelect: (payerId: string) => void;
  onDateChange: (date: Date) => void;
  defaultPayerId?: string;
}

export const CartHeader = ({ 
  selectedPayerId, 
  date, 
  onPayerSelect, 
  onDateChange,
  defaultPayerId 
}: CartHeaderProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <PayerSelector
            selectedPayer={selectedPayerId || defaultPayerId || ''}
            setSelectedPayer={onPayerSelect}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};