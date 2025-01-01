import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PayerSearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const PayerSearchInput = ({ searchQuery, onSearchChange }: PayerSearchInputProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search payers..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};