import { Transaction } from "@/types/transaction";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DailyTransactionsChartProps {
  transactions: Transaction[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DailyTransactionsChart = ({
  transactions,
  dateRange,
  onDateRangeChange,
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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Daily Income vs Expenses</h3>
        <DatePickerWithRange date={dateRange} setDate={onDateRangeChange} />
      </div>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <BarChart data={dailyData}>
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), "MMM dd")}
            />
            <YAxis />
            <ChartTooltip>
              <ChartTooltipContent />
            </ChartTooltip>
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
        </ChartContainer>
      </div>
    </Card>
  );
};