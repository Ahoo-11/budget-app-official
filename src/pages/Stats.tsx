import { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionTypeDistribution } from "@/components/stats/TransactionTypeDistribution";
import { TransactionReports } from "@/components/stats/TransactionReports";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/transaction";

const Stats = () => {
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedSource, setSelectedSource] = useState("");
  const { transactions } = useTransactions(selectedSource);

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', date.from?.toISOString() || '')
        .lte('date', date.to?.toISOString() || '');
      
      if (error) throw error;
      
      return (data || []).map(transaction => ({
        ...transaction,
        type: transaction.type as "income" | "expense"
      })) as Transaction[];
    }
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <StatsHeader />
        <FiltersCard
          date={date}
          setDate={setDate}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Total Income</h3>
                <p className="text-2xl text-success">
                  MVR{" "}
                  {transactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                    .toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
                <p className="text-2xl text-danger">
                  MVR{" "}
                  {transactions
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                    .toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Net Balance</h3>
                <p className="text-2xl">
                  MVR{" "}
                  {transactions
                    .reduce(
                      (sum, t) =>
                        sum +
                        (t.type === "income"
                          ? Number(t.amount)
                          : -Number(t.amount)),
                      0
                    )
                    .toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
                <p className="text-2xl">{transactions.length}</p>
              </Card>
            </div>
            <DailyTransactionsChart
              transactions={allTransactions}
              dateRange={date}
            />
          </TabsContent>

          <TabsContent value="types">
            <TransactionTypeDistribution
              transactions={transactions}
              dateRange={date}
            />
          </TabsContent>

          <TabsContent value="reports">
            <TransactionReports
              transactions={transactions}
              dateRange={date}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Stats;