import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BillListSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const BillListSearch = ({ searchQuery, setSearchQuery }: BillListSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by bill ID or payer name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};