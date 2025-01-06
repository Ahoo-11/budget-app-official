import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FiltersCard } from "@/components/filters/FiltersCard";
import { useBillManagement } from "@/hooks/useBillManagement";
import { BillListHeader } from "./list/BillListHeader";
import { BillListSearch } from "./list/BillListSearch";
import { BillListTabs } from "./list/BillListTabs";

export const BillListContainer = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { bills } = useBillManagement(selectedSource === 'all' ? null : selectedSource);

  const pendingBills = bills.filter(bill => 
    bill.status === 'pending' || bill.status === 'partially_paid'
  );
  const paidBills = bills.filter(bill => bill.status === 'paid');

  const filterBillsByDate = (billList: typeof bills) => {
    return billList.filter((bill) => {
      if (!date?.from && !date?.to) return true;
      const billDate = new Date(bill.date || bill.created_at);
      const matchesDateRange = (!date?.from || billDate >= date.from) && 
                             (!date?.to || billDate <= date.to);
      const matchesSearch = searchQuery === "" || 
                          bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (bill.payer_name && bill.payer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDateRange && matchesSearch;
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
        <BillListHeader />

        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          showSourceSelector={true}
        />

        <BillListSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Card className="p-6">
          <BillListTabs 
            pendingBills={filteredPendingBills}
            paidBills={filteredPaidBills}
          />
        </Card>
      </motion.div>
    </div>
  );
};