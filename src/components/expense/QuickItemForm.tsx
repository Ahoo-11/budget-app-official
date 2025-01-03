import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";

interface QuickItemFormProps {
  sourceId: string;
  onSuccess: (product: Product) => void;
}

export const QuickItemForm = ({ sourceId, onSuccess }: QuickItemFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"product" | "inventory">("product");
  const [quantity, setQuantity] = useState("1");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          source_id: sourceId,
          name,
          current_stock: parseFloat(quantity),
          purchase_cost: parseFloat(purchaseCost),
          price: type === "product" ? parseFloat(price) : parseFloat(purchaseCost),
          category: type === "product" ? "Product" : "inventory",
          subcategory: type === "product" ? "Product" : "Inventory Item"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully",
      });

      onSuccess(data);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Item Type</Label>
        <RadioGroup
          value={type}
          onValueChange={(value) => setType(value as "product" | "inventory")}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="product" id="product" />
            <Label htmlFor="product">Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inventory" id="inventory" />
            <Label htmlFor="inventory">Inventory</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          required
        />
      </div>

      <div>
        <Label>Quantity</Label>
        <Input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Purchase Cost</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={purchaseCost}
          onChange={(e) => setPurchaseCost(e.target.value)}
          required
        />
      </div>

      {type === "product" && (
        <div>
          <Label>Selling Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Item...
          </>
        ) : (
          "Add Item"
        )}
      </Button>
    </form>
  );
};