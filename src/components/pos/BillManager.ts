import { useEffect, useState } from "react";
import { Bill, BillProduct } from "@/types/bills";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const BillManager = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const { toast } = useToast();

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*');

      if (error) throw error;

      setBills(data as Bill[]);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bills",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold">Bill Manager</h2>
      <ul>
        {bills.map(bill => (
          <li key={bill.id}>
            <div>
              <h3>Bill #{bill.id}</h3>
              <p>Status: {bill.status}</p>
              <p>Total: MVR {bill.total?.toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
