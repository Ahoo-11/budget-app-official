import { Bill } from "@/types/bills";
import { BillListItem } from "./BillListItem";

interface BillListProps {
  bills: Bill[];
}

export const BillList = ({ bills }: BillListProps) => {
  if (!bills.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No bills found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <BillListItem key={bill.id} bill={bill} />
      ))}
    </div>
  );
};