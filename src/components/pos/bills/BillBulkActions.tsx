import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BillBulkActionsProps {
  selectedBills: string[];
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  onDeleteSelected: () => void;
  totalBills: number;
}

export const BillBulkActions = ({
  selectedBills,
  onSelectAll,
  isAllSelected,
  onDeleteSelected,
  totalBills,
}: BillBulkActionsProps) => {
  if (totalBills === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          {selectedBills.length} selected
        </span>
      </div>
      {selectedBills.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Selected
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Bills</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedBills.length} selected {selectedBills.length === 1 ? 'bill' : 'bills'}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteSelected}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, delete bills
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};