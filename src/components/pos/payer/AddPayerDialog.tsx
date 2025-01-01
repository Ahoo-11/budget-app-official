import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddPayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
}

export const AddPayerDialog = ({
  isOpen,
  onOpenChange,
  onAdd,
}: AddPayerDialogProps) => {
  const [newPayerName, setNewPayerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayerName.trim()) {
      onAdd(newPayerName.trim());
      setNewPayerName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Payer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Payer name"
            value={newPayerName}
            onChange={(e) => setNewPayerName(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Add Payer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};