import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { SourceSelector } from "@/components/SourceSelector";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface FiltersCardProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
}

export const FiltersCard = ({
  date,
  setDate,
  selectedSource,
  setSelectedSource,
}: FiltersCardProps) => {
  return (
    <Card className="p-6 mb-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Date Range</label>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Source</label>
          <SourceSelector
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
          />
        </div>
      </div>
    </Card>
  );
};