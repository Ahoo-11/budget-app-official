import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionStatus } from "@/types/transaction";

interface TransactionFormProps {
  description: string;
  setDescription: (description: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  date: Date;
  setDate: (date: Date) => void;
  status: TransactionStatus;
  setStatus: (status: TransactionStatus) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  sourceId?: string;
  documentUrl?: string;
  onDocumentUpload?: (file: File) => Promise<void>;
}

export const TransactionForm = ({
  description,
  setDescription,
  amount,
  setAmount,
  date,
  setDate,
  status,
  setStatus,
  isSubmitting,
  isEditing = false,
  sourceId,
  documentUrl,
  onDocumentUpload,
}: TransactionFormProps) => {
  const { data: services = [] } = useQuery({
    queryKey: ['services', sourceId],
    queryFn: async () => {
      if (!sourceId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('source_id', sourceId)
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!sourceId
  });

  const handleServiceSelect = (service: Service) => {
    setDescription(service.name);
    setAmount(service.price.toString());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDocumentUpload) {
      await onDocumentUpload(file);
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
          placeholder="Enter description"
          required
          disabled={isSubmitting}
        />
      </div>

      {sourceId && (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="services">Select Service</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-success/20"
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="services">
            <div className="space-y-4">
              {services.length > 0 ? (
                <div className="grid gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className="w-full p-4 text-left border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${service.price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No services found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as TransactionStatus)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Supporting Document</label>
        <Input
          type="file"
          onChange={handleFileChange}
          disabled={isSubmitting}
          accept="image/*,.pdf"
        />
        {documentUrl && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline mt-2 block"
          >
            View current document
          </a>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-success text-white p-3 rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isEditing ? "Updating..." : "Adding..."}
          </>
        ) : (
          isEditing ? "Update Transaction" : "Add Transaction"
        )}
      </Button>
    </>
  );
};