import { Bill } from "@/types/bills";
import { Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface BillListItemProps {
  bill: Bill;
}

export const BillListItem = ({ bill }: BillListItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
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
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('bills')
        .update({ status: newStatus })
        .eq('id', bill.id);

      if (error) throw error;

      // Invalidate and refetch bills query
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      toast.success('Bill status updated successfully');
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Failed to update bill status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
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
  );
};