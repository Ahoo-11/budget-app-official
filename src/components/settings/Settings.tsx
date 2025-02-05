import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./UserManagement";
import { PreferencesTab } from "./PreferencesTab";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="payers">Payers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* <CategoryManager /> */}
        </TabsContent>

        <TabsContent value="payers" className="space-y-4">
          {/* <PayerManager /> */}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          {/* <SupplierManager /> */}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* <TemplateManager /> */}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
