import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SupplierFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SupplierForm = ({ onSuccess, onCancel }: SupplierFormProps) => {
  const session = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [supplier, setSupplier] = useState({
    name: "",
    contact_info: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplier.name,
          contact_info: supplier.contact_info ? JSON.parse(supplier.contact_info) : null,
          address: supplier.address,
          user_id: session.user.id
        }]);

      if (error) throw error;
      onSuccess();
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Supplier name"
          value={supplier.name}
          onChange={(e) => setSupplier(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Textarea
          placeholder="Contact information (JSON format)"
          value={supplier.contact_info}
          onChange={(e) => setSupplier(prev => ({ ...prev, contact_info: e.target.value }))}
        />
      </div>
      <div>
        <Input
          placeholder="Address"
          value={supplier.address}
          onChange={(e) => setSupplier(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!supplier.name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Supplier'
          )}
        </Button>
      </div>
    </form>
  );
};