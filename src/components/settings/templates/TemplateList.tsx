import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TemplateCard } from "./TemplateCard";
import { Template } from "@/types/template";

interface TemplateListProps {
  onConfigureTemplate: (template: Template) => void;
}

interface RawTemplate {
  id: string;
  name: string;
  type: 'business' | 'personal';
  config: any;
  created_at: string;
  updated_at: string;
}

const transformTemplate = (raw: RawTemplate): Template => {
  const config = typeof raw.config === 'string' ? JSON.parse(raw.config) : raw.config;
  return {
    ...raw,
    config: {
      layout: config.layout || 'grid',
      itemLabel: config.itemLabel || 'Item',
      fields: config.fields || {},
      categories: config.categories || []
    }
  };
};

export const TemplateList = ({ onConfigureTemplate }: TemplateListProps) => {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data as RawTemplate[]).map(transformTemplate);
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