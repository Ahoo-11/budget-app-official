import { ServiceGrid } from "@/components/pos/ServiceGrid";

interface ServicesListProps {
  sourceId: string;
}

export const ServicesList = ({ sourceId }: ServicesListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services</h2>
      </div>
      <ServiceGrid sourceId={sourceId} />
    </div>
  );
};