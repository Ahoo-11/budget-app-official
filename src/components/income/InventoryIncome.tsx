import { useParams } from "react-router-dom";
import { InventoryManager } from "@/components/inventory/InventoryManager";

interface InventoryIncomeProps {
  sourceId: string;
}

export const InventoryIncome = ({ sourceId }: InventoryIncomeProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inventory Management</h2>
      <InventoryManager sourceId={sourceId} />
    </div>
  );
};