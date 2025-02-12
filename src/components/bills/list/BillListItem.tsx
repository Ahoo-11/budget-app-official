import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BillStatusSelect } from "./BillStatusSelect";
import { BillPaymentDialog } from "./BillPaymentDialog";
import { DollarSign } from "lucide-react";
import type { Database } from "@/types/database-types";

type Bill = Database["budget_app"]["Tables"]["bills"]["Row"] & {
  items: BillItem[];
};

type BillItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

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
        items: bill.items
      };

      const { error } = await supabase
        .from('budgetapp_bills')
        .update(updateData)
        .eq('id', bill.id)
        .select();

      if (error) {
        console.error('Error updating bill:', error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success(`Bill status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Failed to update bill status. Please try again.');
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
        items: bill.items
      };

      const { error } = await supabase
        .from('budgetapp_bills')
        .update(updateData)
        .eq('id', bill.id)
        .select();

      if (error) {
        console.error('Error recording payment:', error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Payment recorded successfully');
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const remainingAmount = bill.total - (bill.paid_amount || 0);

  return (
    <>
      <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{bill.title}</h3>
            <p className="text-sm text-gray-500">
              Due: {new Date(bill.due_date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {bill.total.toFixed(2)}
              </p>
              {bill.status === 'partially_paid' && (
                <p className="text-sm text-gray-500">
                  Remaining: ${remainingAmount.toFixed(2)}
                </p>
              )}
            </div>
            
            <BillStatusSelect
              currentStatus={bill.status}
              onStatusChange={handleStatusChange}
              isLoading={isUpdating}
            />
          </div>
        </div>

        {bill.items.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Items</h4>
            <ul className="space-y-2">
              {bill.items.map((item, index) => (
                <li key={item.id || index} className="text-sm text-gray-600 flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${item.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <BillPaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSubmit={handlePaymentSubmit}
        billTotal={bill.total}
        currentAmount={paymentAmount}
        setAmount={setPaymentAmount}
        isLoading={isUpdating}
      />
    </>
  );
};