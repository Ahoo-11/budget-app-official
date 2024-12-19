import { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { FiltersCard } from "@/components/stats/FiltersCard";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#34C759", "#FF3B30", "#007AFF", "#FF9500", "#5856D6"];

const Types = () => {
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedSource, setSelectedSource] = useState("");
  const { transactions } = useTransactions();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!date.from || transactionDate >= date.from) && 
                            (!date.to || transactionDate <= date.to);
    const matchesSource = !selectedSource || transaction.source_id === selectedSource;
    
    return matchesDateRange && matchesSource;
  });

  const sourceStats = filteredTransactions.reduce((acc: any[], transaction) => {
    const sourceIndex = acc.findIndex(item => item.name === transaction.source_id);
    if (sourceIndex === -1) {
      acc.push({
        name: transaction.source_id,
        value: Number(transaction.amount)
      });
    } else {
      acc[sourceIndex].value += Number(transaction.amount);
    }
    return acc;
  }, []);

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
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Source Distribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Types;