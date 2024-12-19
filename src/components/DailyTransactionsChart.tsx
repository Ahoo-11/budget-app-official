import { Transaction } from "@/types/transaction";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DailyTransactionsChartProps {
  transactions: Transaction[];
  dateRange: DateRange;
  onDateRangeChange?: (range: DateRange) => void;  // Made optional with ?
}

export const DailyTransactionsChart = ({
  transactions,
  dateRange,
}: DailyTransactionsChartProps) => {
  const dailyData = transactions.reduce((acc: any[], transaction) => {
    const date = format(new Date(transaction.date), "yyyy-MM-dd");
    const existingDay = acc.find((item) => item.date === date);

    if (existingDay) {
      if (transaction.type === "income") {
        existingDay.income += Number(transaction.amount);
      } else {
        existingDay.expense += Number(transaction.amount);
      }
    } else {
      acc.push({
        date,
        income: transaction.type === "income" ? Number(transaction.amount) : 0,
        expense: transaction.type === "expense" ? Number(transaction.amount) : 0,
      });
    }

    return acc;
  }, []);

  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));

  const chartConfig = {
    income: {
      color: "#34C759",
    },
    expense: {
      color: "#FF3B30",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{format(parseISO(label), "MMM dd, yyyy")}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Daily Income vs Expenses</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), "MMM dd")}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              name="Income"
              dataKey="income"
              fill={chartConfig.income.color}
            />
            <Bar
              name="Expenses"
              dataKey="expense"
              fill={chartConfig.expense.color}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};