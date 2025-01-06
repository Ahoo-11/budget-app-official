import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bill } from "@/types/bills";
import { BillList } from "./BillList";

interface BillListTabsProps {
  pendingBills: Bill[];
  paidBills: Bill[];
}

export const BillListTabs = ({ pendingBills, paidBills }: BillListTabsProps) => {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="pending">
          Pending Bills ({pendingBills.length})
        </TabsTrigger>
        <TabsTrigger value="paid">
          Paid Bills ({paidBills.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        <BillList bills={pendingBills} />
      </TabsContent>
      
      <TabsContent value="paid">
        <BillList bills={paidBills} />
      </TabsContent>
    </Tabs>
  );
};