import { useState } from "react";
import { motion } from "framer-motion";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { TransactionList } from "./TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill } from "@/types/bill";

const TransactionListContainer = () => {
  const [selectedSource, setSelectedSource] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { transactions, isLoading: isLoadingTransactions } = useTransactions();
  
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      console.log('Fetching bills...');
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }
      
      console.log('Fetched bills:', data);
      return data as Bill[];
    },
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!date?.from || transactionDate >= date.from) && 
                            (!date?.to || transactionDate <= date.to);
    const matchesSource = !selectedSource || transaction.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.date);
    const matchesDateRange = (!date?.from || billDate >= date.from) && 
                            (!date?.to || billDate <= date.to);
    const matchesSource = !selectedSource || bill.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  if (isLoadingTransactions || isLoadingBills) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

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
              Track Your Expenses
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Recent Activity
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep track of your recent expenses, income, and bills with our beautiful and intuitive
            interface.
          </p>
        </header>

        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />

        <Card className="p-6">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="transactions">
                Transactions ({filteredTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="bills">
                Bills ({filteredBills.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions">
              <TransactionList transactions={filteredTransactions} />
            </TabsContent>
            
            <TabsContent value="bills">
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Bill #{bill.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Total: ${bill.total}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {bill.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredBills.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No bills found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default TransactionListContainer;