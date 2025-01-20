import { ServiceGrid } from "@/components/pos/ServiceGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceForm } from "@/components/services/ServiceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServicesListProps {
  sourceId: string;
}

export const ServicesList = ({ sourceId }: ServicesListProps) => {
  const [isAddingService, setIsAddingService] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={() => setIsAddingService(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <ServiceGrid sourceId={sourceId} />

      <Dialog 
        open={isAddingService} 
        onOpenChange={setIsAddingService}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingService(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};