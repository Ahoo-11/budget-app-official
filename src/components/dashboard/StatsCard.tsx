import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColorClass: string;
  iconBgClass: string;
}

export const StatsCard = ({ icon: Icon, label, value, iconColorClass, iconBgClass }: StatsCardProps) => {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white shadow-sm border card-hover"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};