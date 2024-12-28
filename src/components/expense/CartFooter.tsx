import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CartFooterProps {
  total: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const CartFooter = ({ total, isSubmitting, onSubmit }: CartFooterProps) => {
  return (
    <div className="pt-4 border-t">
      <div className="flex justify-between items-center font-medium text-lg">
        <span>Invoice Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <Button
        className="w-full mt-4 bg-black text-white hover:bg-black/90"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording Purchase...
          </>
        ) : (
          "ADD TRANSACTION"
        )}
      </Button>
    </div>
  );
};