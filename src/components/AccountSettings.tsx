import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./settings/UserManagement";
import { CategoryManager } from "./settings/CategoryManager";
import { PayerManager } from "./settings/PayerManager";
import { DisplayNameManager } from "./settings/DisplayNameManager";
import { ThemeSelector } from "./settings/ThemeSelector";
import { TemplateManager } from "./settings/templates/TemplateManager";

export function AccountSettings() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="payers">Payers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="payers" className="space-y-6">
          <PayerManager />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6">
            <DisplayNameManager />
            <ThemeSelector />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}