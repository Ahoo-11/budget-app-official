import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoyaltyIncomeForm } from "./forms/RoyaltyIncomeForm";
import { EmploymentIncomeForm } from "./forms/EmploymentIncomeForm";
import { RentalIncomeForm } from "./forms/RentalIncomeForm";
import { InvestmentIncomeForm } from "./forms/InvestmentIncomeForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IncomeTypeManagerProps {
  sourceId: string;
}

export const IncomeTypeManager = ({ sourceId }: IncomeTypeManagerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("royalty");

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("income_entries")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income entry added successfully",
      });
    } catch (error) {
      console.error("Error adding income entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add income entry",
      });
    }
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="royalty">Royalty</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="rental">Rental</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>

        <TabsContent value="royalty">
          <RoyaltyIncomeForm sourceId={sourceId} onSubmit={handleSubmit} />
        </TabsContent>

        <TabsContent value="employment">
          <EmploymentIncomeForm sourceId={sourceId} onSubmit={handleSubmit} />
        </TabsContent>

        <TabsContent value="rental">
          <RentalIncomeForm sourceId={sourceId} onSubmit={handleSubmit} />
        </TabsContent>

        <TabsContent value="investment">
          <InvestmentIncomeForm sourceId={sourceId} onSubmit={handleSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};