import { ConsignmentList } from "./ConsignmentList";

interface ConsignmentsListProps {
  sourceId: string;
}

export const ConsignmentsList = ({ sourceId }: ConsignmentsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Consignments</h2>
      </div>
      <ConsignmentList sourceId={sourceId} />
    </div>
  );
};