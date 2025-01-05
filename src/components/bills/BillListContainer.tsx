import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FiltersCard } from "@/components/filters/FiltersCard";
import { useBillManagement } from "@/hooks/useBillManagement";
import { Bill } from "@/types/bills";
import { cn } from "@/lib/utils";

const BillList = ({ bills }: { bills: Bill[] }) => {
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
        <div key={bill.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
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
              <p className="text-sm">
                Status: <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  bill.status === 'paid' ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                )}>{bill.status}</span>
              </p>
              {bill.payer_name && (
                <p className="text-sm text-muted-foreground">
                  Payer: {bill.payer_name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BillListContainer = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { bills } = useBillManagement(selectedSource === 'all' ? null : selectedSource);

  console.log('📊 BillListContainer - bills:', bills);

  const pendingBills = bills.filter(bill => 
    bill.status === 'pending' || bill.status === 'partially_paid'
  );
  const paidBills = bills.filter(bill => bill.status === 'paid');

  const filterBillsByDate = (billList: Bill[]) => {
    return billList.filter((bill) => {
      if (!date?.from && !date?.to) return true;
      const billDate = new Date(bill.date || bill.created_at);
      const matchesDateRange = (!date?.from || billDate >= date.from) && 
                             (!date?.to || billDate <= date.to);
      return matchesDateRange;
    });
  };

  const filteredPendingBills = filterBillsByDate(pendingBills);
  const filteredPaidBills = filterBillsByDate(paidBills);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <header className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1 text-sm bg-success/10 text-success rounded-full">
              Track Your Bills
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bill History
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep track of your pending and paid bills with our beautiful and intuitive
            interface.
          </p>
        </header>

        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          showSourceSelector={true}
        />

        <Card className="p-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="pending">
                Pending Bills ({filteredPendingBills.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid Bills ({filteredPaidBills.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <BillList bills={filteredPendingBills} />
            </TabsContent>
            
            <TabsContent value="paid">
              <BillList bills={filteredPaidBills} />
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};