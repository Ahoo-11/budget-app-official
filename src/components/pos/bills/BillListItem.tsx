import { Bill } from "@/types/bill";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface BillListItemProps {
  bill: Bill;
  isSelected: boolean;
  onSelect: (billId: string, isSelected: boolean) => void;
  activeBillId: string | null;
  onBillClick: (billId: string) => void;
}

export const BillListItem = ({
  bill,
  isSelected,
  onSelect,
  activeBillId,
  onBillClick,
}: BillListItemProps) => {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg hover:bg-gray-50 flex items-start gap-3",
        bill.id === activeBillId ? "border-primary" : ""
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(bill.id, checked as boolean)}
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="flex-1 cursor-pointer"
        onClick={() => onBillClick(bill.id)}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Bill #{bill.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(bill.created_at).toLocaleString()}
            </p>
          </div>
          <div className="text-sm">
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};