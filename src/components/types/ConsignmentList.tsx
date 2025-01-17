import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsignmentForm } from "./ConsignmentForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConsignmentListProps {
  sourceId: string;
}

export const ConsignmentList = ({ sourceId }: ConsignmentListProps) => {
  const [isAddingConsignment, setIsAddingConsignment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price">("name");

  const { data: consignments = [], isLoading, error } = useQuery({
    queryKey: ['consignments', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consignments')
        .select('*, suppliers(name)')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredAndSortedConsignments = consignments
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "stock":
          return (b.current_stock || 0) - (a.current_stock || 0);
        case "price":
          return b.selling_price - a.selling_price;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getStockStatus = (current: number | null, minimum: number | null) => {
    if (current === null || minimum === null) return "unknown";
    if (current <= 0) return "out";
    if (current <= minimum) return "low";
    return "good";
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading consignments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Consignment Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your consignment inventory and track supplier settlements
          </p>
        </div>
        <Button onClick={() => setIsAddingConsignment(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Consignment
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search consignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "name" | "stock" | "price") => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stock">Stock Level</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedConsignments.map((consignment) => (
          <Card key={consignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{consignment.name}</span>
                <Badge variant={
                  getStockStatus(consignment.current_stock, consignment.minimum_stock_level) === "out" ? "destructive" :
                  getStockStatus(consignment.current_stock, consignment.minimum_stock_level) === "low" ? "warning" :
                  "success"
                }>
                  {consignment.current_stock || 0} {consignment.unit_of_measurement || 'units'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Supplier: {consignment.suppliers?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selling Price:</span>
                  <span className="font-medium">₱{consignment.selling_price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Cost:</span>
                  <span className="font-medium">₱{consignment.unit_cost}</span>
                </div>
                {consignment.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {consignment.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddingConsignment} onOpenChange={setIsAddingConsignment}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add New Consignment</DialogTitle>
          </DialogHeader>
          <ConsignmentForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingConsignment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};