import { useState } from "react";
import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";
import { QuickIncomeFormData } from "@/types/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickIncomeFormProps {
  sourceId: string;
  onSuccess?: (data: QuickIncomeFormData) => void;
}

export const QuickIncomeForm = ({ sourceId, onSuccess }: QuickIncomeFormProps) => {
  const { toast } = useToast();
  const { incomeTypes, getSubcategories, isIncomeTypeEnabled } = useIncomeTypes(sourceId);
  const { addIncome } = useIncomeEntries({ sourceId });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickIncomeFormData>({
    name: "",
    income_type_id: "",
    subcategory_id: "",
    amount: 0,
    date: new Date(),
    source: "",
  });

  // Filter out disabled income types
  const availableIncomeTypes = incomeTypes.filter((type) =>
    isIncomeTypeEnabled(type.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addIncome.mutateAsync(formData);
      
      toast({
        title: "Success",
        description: "Income added successfully",
      });

      if (onSuccess) {
        onSuccess(formData);
      }

      // Reset form
      setFormData({
        name: "",
        income_type_id: "",
        subcategory_id: "",
        amount: 0,
        date: new Date(),
        source: "",
      });
    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Income Type</Label>
        <Select
          value={formData.income_type_id}
          onValueChange={(value) =>
            setFormData({ ...formData, income_type_id: value, subcategory_id: "" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select income type" />
          </SelectTrigger>
          <SelectContent>
            {availableIncomeTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.income_type_id && (
        <div>
          <Label>Subcategory</Label>
          <Select
            value={formData.subcategory_id}
            onValueChange={(value) =>
              setFormData({ ...formData, subcategory_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {getSubcategories(formData.income_type_id).map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Description</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Brief description"
          required
        />
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={formData.amount || ""}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <Label>Source</Label>
        <Input
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="Income source"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Income...
          </>
        ) : (
          "Add Income"
        )}
      </Button>
    </form>
  );
};
