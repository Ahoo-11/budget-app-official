import { Template } from "@/types/template";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onConfigure: (template: Template) => void;
}

export const TemplateCard = ({ template, onConfigure }: TemplateCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{template.name}</h3>
          <Badge variant="outline">{template.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {Object.keys(template.config.fields).length} fields configured
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <button
          onClick={() => onConfigure(template)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4 mr-1" />
          Configure
        </button>
      </CardFooter>
    </Card>
  );
};