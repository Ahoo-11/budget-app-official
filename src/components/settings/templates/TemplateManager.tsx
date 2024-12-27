import { useState } from "react";
import { Template } from "@/types/template";
import { TemplateList } from "./TemplateList";
import { TemplateConfigDialog } from "./TemplateConfigDialog";

export const TemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Templates</h2>
        <p className="text-muted-foreground">
          Manage templates that can be assigned to sources.
        </p>
      </div>

      <TemplateList
        onConfigureTemplate={(template) => setSelectedTemplate(template)}
      />

      {selectedTemplate && (
        <TemplateConfigDialog
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
};