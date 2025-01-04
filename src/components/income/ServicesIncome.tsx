import { useParams } from "react-router-dom";
import { ServiceGrid } from "@/components/pos/ServiceGrid";

interface ServicesIncomeProps {
  sourceId: string;
}

export const ServicesIncome = ({ sourceId }: ServicesIncomeProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Services Income</h2>
      <ServiceGrid sourceId={sourceId} />
    </div>
  );
};