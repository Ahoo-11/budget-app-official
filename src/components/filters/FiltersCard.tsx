import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { DateRangeFilter } from "./DateRangeFilter";
import { SourceFilter } from "./SourceFilter";

interface FiltersCardProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
  showSourceSelector?: boolean;
}

export const FiltersCard = ({
  date,
  setDate,
  selectedSource,
  setSelectedSource,
  showSourceSelector = false,
}: FiltersCardProps) => {
  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <DateRangeFilter date={date} setDate={setDate} />
        <SourceFilter
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          showSourceSelector={showSourceSelector}
        />
      </div>
    </Card>
  );
};