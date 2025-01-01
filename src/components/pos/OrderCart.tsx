import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Trash2 } from "lucide-react";
import { BillProduct } from "@/types/bill";
import { PayerSelector } from "./payer/PayerSelector";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useBillUpdates } from "./bill/useBillUpdates";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrderCartProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (payerId?: string) => void;
  isSubmitting?: boolean;
  activeBillId?: string;
}

export const OrderCart = ({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isSubmitting = false,
  activeBillId,
}: OrderCartProps) => {
  const { toast } = useToast();
  const {
    discount,
    date,
    selectedPayerId,
    subtotal,
    gstAmount,
    finalTotal,
    handlePayerSelect,
    handleDateChange,
    handleDiscountChange
  } = useBillUpdates(activeBillId, items);

  const handleCheckout = () => {
    onCheckout(selectedPayerId || undefined);
  };

  const handleCancelBill = async () => {
    if (!activeBillId) return;

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', activeBillId);

      if (error) throw error;

      toast({
        title: "Bill cancelled",
        description: "The bill has been successfully cancelled.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error cancelling bill:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white h-full flex flex-col border rounded-lg">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <PayerSelector
              selectedPayerId={selectedPayerId}
              setSelectedPayer={handlePayerSelect}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => date && handleDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-t p-4">
        <h3 className="font-medium text-lg">Order Summary</h3>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between pb-4 border-b">
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">MVR {item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-20 h-8"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items in cart
            </div>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>MVR {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">GST (8%)</span>
              <span>MVR {gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="discount" className="text-sm text-muted-foreground">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="text-sm text-right pt-5">
                MVR {discount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center font-medium text-lg">
              <span>Total</span>
              <span>MVR {finalTotal.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Bill
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Bill</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this bill? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Bill</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelBill}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, cancel bill
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="flex-1 bg-black text-white hover:bg-black/90"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "CHECKOUT"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
