import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddPayerDialogProps {
  onAdd: (name: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPayerDialog = ({ onAdd, isOpen, onOpenChange }: AddPayerDialogProps) => {
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
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
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