import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionStatus } from "@/types/transaction";
import { BasicTransactionInfo } from "./transaction/form/BasicTransactionInfo";
import { DateSelector } from "./transaction/form/DateSelector";
import { StatusSelector } from "./transaction/form/StatusSelector";
import { DocumentUpload } from "./transaction/form/DocumentUpload";

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
    // Service price already includes GST, so we can set it directly
    setAmount(service.price.toString());
  };

  return (
    <div className="space-y-6">
      <BasicTransactionInfo
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        isSubmitting={isSubmitting}
      />

      {sourceId && (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="services">Select Service</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="space-y-4">
              {/* Manual entry fields are already in BasicTransactionInfo */}
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

      <StatusSelector
        status={status}
        setStatus={setStatus}
        isSubmitting={isSubmitting}
      />

      <DateSelector
        date={date}
        setDate={setDate}
        isSubmitting={isSubmitting}
      />

      <DocumentUpload
        documentUrl={documentUrl}
        onDocumentUpload={onDocumentUpload}
        isSubmitting={isSubmitting}
      />

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
    </div>
  );
};
