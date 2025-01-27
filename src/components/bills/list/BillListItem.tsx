import { Bill } from "@/types/bills";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { serializeBillItems } from "@/types/bills";
import { BillStatusSelect } from "./BillStatusSelect";
import { BillPaymentDialog } from "./BillPaymentDialog";
import { DollarSign } from "lucide-react";

interface BillListItemProps {
  bill: Bill;
}

export const BillListItem = ({ bill }: BillListItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(bill.paid_amount || 0);
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: Bill['status']) => {
    if (newStatus === 'partially_paid') {
      setShowPaymentDialog(true);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData = {
        status: newStatus,
        paid_amount: newStatus === 'paid' ? bill.total : 0,
        items: serializeBillItems(bill.items)
      };

      console.log('Updating bill with data:', updateData);

      const { error } = await supabase
        .from('bills')
        .update(updateData)
        .eq('id', bill.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success(`Bill status updated to ${newStatus}`);
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

      const updateData = {
        status: paymentAmount >= bill.total ? 'paid' : 'partially_paid',
        paid_amount: paymentAmount,
        items: serializeBillItems(bill.items)
      };

      console.log('Submitting payment with data:', updateData);

      const { error } = await supabase
        .from('bills')
        .update(updateData)
        .eq('id', bill.id);

      if (error) {
        console.error('Payment error details:', error);
        throw error;
      }

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
            {bill.payment_method && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Payment: {bill.payment_method.charAt(0).toUpperCase() + bill.payment_method.slice(1)}
              </p>
            )}
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
            <BillStatusSelect
              status={bill.status}
              onStatusChange={handleStatusChange}
              isUpdating={isUpdating}
            />
            {bill.payer_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Payer: {bill.payer_name}
              </p>
            )}
          </div>
        </div>
      </div>

      <BillPaymentDialog
        bill={bill}
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={setShowPaymentDialog}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        onSubmit={handlePaymentSubmit}
        isUpdating={isUpdating}
      />
    </>
  );
};