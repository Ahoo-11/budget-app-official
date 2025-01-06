import { Bill } from "@/types/bills";
import { Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { serializeBillItems } from "@/types/bills";

interface BillListItemProps {
  bill: Bill;
}

export const BillListItem = ({ bill }: BillListItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(bill.paid_amount || 0);
  const [selectedStatus, setSelectedStatus] = useState<Bill['status']>(bill.status);
  const queryClient = useQueryClient();

  const getStatusIcon = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'partially_paid':
        return <DollarSign className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'partially_paid':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleStatusChange = async (newStatus: Bill['status']) => {
    if (newStatus === 'partially_paid') {
      setSelectedStatus(newStatus);
      setShowPaymentDialog(true);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData = {
        status: newStatus,
        paid_amount: newStatus === 'paid' ? bill.total : 0,
        items: serializeBillItems(bill.items) // Serialize items before sending to Supabase
      };

      const { error } = await supabase
        .from('bills')
        .update(updateData)
        .eq('id', bill.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill status updated successfully');
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Failed to update bill status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      setIsUpdating(true);

      if (paymentAmount > bill.total) {
        toast.error('Payment amount cannot exceed total bill amount');
        return;
      }

      const { error } = await supabase
        .from('bills')
        .update({
          status: 'partially_paid',
          paid_amount: paymentAmount,
          items: serializeBillItems(bill.items) // Serialize items before sending to Supabase
        })
        .eq('id', bill.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Payment recorded successfully');
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const remainingAmount = bill.total - (bill.paid_amount || 0);

  return (
    <>
      <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Bill #{bill.id.slice(0, 8)}</h3>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(bill.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Items: {bill.items.length}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">Total: MVR {bill.total?.toFixed(2)}</p>
            {bill.paid_amount > 0 && (
              <p className="text-sm text-muted-foreground">
                Paid: MVR {bill.paid_amount.toFixed(2)}
              </p>
            )}
            {bill.status === 'partially_paid' && (
              <p className="text-sm text-muted-foreground">
                Remaining: MVR {remainingAmount.toFixed(2)}
              </p>
            )}
            <Select
              value={bill.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className={cn(
                "h-8 w-[130px] inline-flex items-center gap-1 text-xs font-medium",
                getStatusColor(bill.status)
              )}>
                <SelectValue>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(bill.status)}
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1).replace('_', ' ')}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="partially_paid">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Partially Paid
                  </span>
                </SelectItem>
                <SelectItem value="paid">
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Paid
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {bill.payer_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Payer: {bill.payer_name}
              </p>
            )}
          </div>
        </div>
      </div>

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
                onClick={handlePaymentSubmit}
                disabled={isUpdating || paymentAmount <= 0 || paymentAmount > bill.total}
              >
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};