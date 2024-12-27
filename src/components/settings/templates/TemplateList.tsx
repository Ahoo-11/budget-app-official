import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TemplateCard } from "./TemplateCard";
import { Template } from "@/types/template";

interface TemplateListProps {
  onConfigureTemplate: (template: Template) => void;
}

export const TemplateList = ({ onConfigureTemplate }: TemplateListProps) => {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onConfigure={onConfigureTemplate}
        />
      ))}
    </div>
  );
};