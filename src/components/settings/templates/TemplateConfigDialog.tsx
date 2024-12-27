import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Template } from "@/types/template";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TemplateConfigDialogProps {
  template: Template;
  sourceId?: string;
  onClose: () => void;
}

export const TemplateConfigDialog = ({
  template,
  sourceId,
  onClose,
}: TemplateConfigDialogProps) => {
  const [config, setConfig] = useState(template.config);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      if (sourceId) {
        const { error } = await supabase
          .from('source_templates')
          .upsert({
            source_id: sourceId,
            template_id: template.id,
            config
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('templates')
          .update({ config })
          .eq('id', template.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Template configuration saved successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['templates'] });
      onClose();
    } catch (error) {
      console.error('Error saving template config:', error);
      toast({
        title: "Error",
        description: "Failed to save template configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(template.config.fields).map(([key, field]: [string, any]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2">
                {field.label}
              </label>
              <Input
                value={field.label}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    fields: {
                      ...config.fields,
                      [key]: { ...field, label: e.target.value },
                    },
                  })
                }
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};