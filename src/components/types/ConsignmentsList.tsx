import { useState } from "react";
import { ConsignmentList } from "./ConsignmentList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConsignmentForm } from "./ConsignmentForm";

interface ConsignmentsListProps {
  sourceId: string;
}

export const ConsignmentsList = ({ sourceId }: ConsignmentsListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Consignments</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Consignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Consignment</DialogTitle>
            </DialogHeader>
            <ConsignmentForm 
              sourceId={sourceId} 
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <ConsignmentList sourceId={sourceId} />
    </div>
  );
};