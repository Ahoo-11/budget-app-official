import { Bill } from "@/types/bills";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BillPaymentDialogProps {
  bill: Bill;
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  paymentAmount: number;
  setPaymentAmount: (amount: number) => void;
  onSubmit: () => void;
  isUpdating: boolean;
}

export const BillPaymentDialog = ({
  bill,
  showPaymentDialog,
  setShowPaymentDialog,
  paymentAmount,
  setPaymentAmount,
  onSubmit,
  isUpdating
}: BillPaymentDialogProps) => {
  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Payment Amount</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Amount (MVR)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={bill.total}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Total Bill Amount: MVR {bill.total.toFixed(2)}</p>
            <p>Remaining Amount: MVR {(bill.total - paymentAmount).toFixed(2)}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isUpdating || paymentAmount <= 0 || paymentAmount > bill.total}
            >
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};