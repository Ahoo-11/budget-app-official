import { useState } from "react";
import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";
import { IncomeFormData } from "@/types/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface IncomeFormProps {
  sourceId: string;
  initialData?: Partial<IncomeFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const IncomeForm = ({
  sourceId,
  initialData,
  onSuccess,
  onCancel,
}: IncomeFormProps) => {
  const { incomeTypes, getSubcategories, isIncomeTypeEnabled } = useIncomeTypes(sourceId);
  const { addIncome, updateIncome } = useIncomeEntries({ sourceId });
  const [formData, setFormData] = useState<IncomeFormData>({
    name: initialData?.name || "",
    income_type_id: initialData?.income_type_id || "",
    subcategory_id: initialData?.subcategory_id || "",
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date(),
    source: initialData?.source || "",
    remarks: initialData?.remarks || "",
    is_recurring: initialData?.is_recurring || false,
    tags: initialData?.tags || [],
    current_stock: initialData?.current_stock,
    minimum_stock: initialData?.minimum_stock,
    unit_of_measure: initialData?.unit_of_measure,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(formData.tags || []);
  const [newTag, setNewTag] = useState("");

  // Filter out disabled income types
  const availableIncomeTypes = incomeTypes.filter((type) =>
    isIncomeTypeEnabled(type.id)
  );

  const isProductSales = formData.income_type_id && 
    incomeTypes.find(t => t.id === formData.income_type_id)?.name === "Product Sales";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        const updatedTags = [...tags, newTag.trim()];
        setTags(updatedTags);
        setFormData({ ...formData, tags: updatedTags });
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setFormData({ ...formData, tags: updatedTags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (initialData?.id) {
        await updateIncome.mutateAsync({
          id: initialData.id,
          data: formData,
        });
      } else {
        await addIncome.mutateAsync(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isSubmitting = addIncome.isPending || updateIncome.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <Label>Photo</Label>
        <div className="mt-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full"
          />
          {photoPreview && (
            <div className="mt-2">
              <img
                src={photoPreview}
                alt="Preview"
                className="max-w-xs rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Income Type & Subcategory */}
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      {/* Name & Amount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Name/Description</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name or description"
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
      </div>

      {/* Date & Source */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Date</Label>
          <Input
            type="datetime-local"
            value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) =>
              setFormData({ ...formData, date: new Date(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <Label>Source</Label>
          <Input
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="Enter source"
            required
          />
        </div>
      </div>

      {/* Product-specific fields */}
      {isProductSales && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Current Stock</Label>
            <Input
              type="number"
              min="0"
              value={formData.current_stock || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_stock: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <Label>Minimum Stock</Label>
            <Input
              type="number"
              min="0"
              value={formData.minimum_stock || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimum_stock: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <Label>Unit of Measure</Label>
            <Input
              value={formData.unit_of_measure || ""}
              onChange={(e) =>
                setFormData({ ...formData, unit_of_measure: e.target.value })
              }
              placeholder="e.g., pieces, kg"
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-secondary rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
        />
      </div>

      {/* Remarks */}
      <div>
        <Label>Remarks</Label>
        <Textarea
          value={formData.remarks || ""}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          placeholder="Additional notes or comments"
          className="h-20"
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_recurring: checked })
          }
        />
        <Label htmlFor="recurring">Recurring Income</Label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {initialData?.id ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{initialData?.id ? "Update" : "Add"} Income</>
          )}
        </Button>
      </div>
    </form>
  );
};
