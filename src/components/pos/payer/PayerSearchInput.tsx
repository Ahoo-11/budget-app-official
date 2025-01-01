import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PayerSearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export const PayerSearchInput = ({
  searchQuery,
  onSearchChange,
  onAddClick
}: PayerSearchInputProps) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Search payers..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        onClick={onAddClick}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};