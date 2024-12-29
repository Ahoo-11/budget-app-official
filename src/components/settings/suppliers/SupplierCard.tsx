import { Building } from "lucide-react";

interface SupplierCardProps {
  supplier: {
    id: string;
    name: string;
    address?: string | null;
    contact_info?: any;
  };
}

export const SupplierCard = ({ supplier }: SupplierCardProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Building className="w-4 h-4" />
        <h4 className="font-medium">{supplier.name}</h4>
      </div>
      {supplier.address && (
        <p className="text-sm text-gray-600">{supplier.address}</p>
      )}
    </div>
  );
};