import { Card } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import { DateRange } from "react-day-picker";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TransactionTypeDistributionProps {
  transactions: Transaction[];
  dateRange: DateRange | undefined;
}

export const TransactionTypeDistribution = ({
  transactions,
  dateRange,
}: TransactionTypeDistributionProps) => {
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!dateRange?.from || transactionDate >= dateRange.from) &&
      (!dateRange?.to || transactionDate <= dateRange.to)
    );
  });

  const categoryData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = Number(transaction.amount);
    
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += amount;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const data = Object.values(categoryData);
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF7C43",
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Transaction Distribution by Category</h3>
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) =>
                `${name}: $${value.toFixed(2)}`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};