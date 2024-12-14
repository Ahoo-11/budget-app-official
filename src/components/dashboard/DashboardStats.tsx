import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";

interface DashboardStatsProps {
  totalBalance: number;
  totalExpenses: number;
  totalIncome: number;
}

export const DashboardStats = ({ totalBalance, totalExpenses, totalIncome }: DashboardStatsProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        icon={DollarSign}
        label="Total Balance"
        value={`$${totalBalance.toFixed(2)}`}
        iconColorClass="text-success"
        iconBgClass="bg-success/10"
      />
      <StatsCard
        icon={CreditCard}
        label="Total Expenses"
        value={`$${totalExpenses.toFixed(2)}`}
        iconColorClass="text-danger"
        iconBgClass="bg-danger/10"
      />
      <StatsCard
        icon={TrendingUp}
        label="Total Income"
        value={`$${totalIncome.toFixed(2)}`}
        iconColorClass="text-success"
        iconBgClass="bg-success/10"
      />
    </div>
  );
};