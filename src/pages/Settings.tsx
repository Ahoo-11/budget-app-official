import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { CategoryManager } from "@/components/settings/CategoryManager";

const Settings = () => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>
      
      <div className="space-y-6">
        <ThemeSelector />
        <CategoryManager />
      </div>
    </div>
  );
};

export default Settings;