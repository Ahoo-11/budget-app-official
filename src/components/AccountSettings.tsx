import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./settings/ThemeSelector";
import { CategoryManager } from "./settings/CategoryManager";
import { useNavigate } from "react-router-dom";

export function AccountSettings() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-6">
        <ThemeSelector />
        <CategoryManager />
      </div>
    </div>
  );
}