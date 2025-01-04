import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomeTypeSettingsProps {
  sourceId: string;
}

export const IncomeTypeSettings = ({ sourceId }: IncomeTypeSettingsProps) => {
  const {
    incomeTypes,
    isLoadingTypes,
    typesError,
    isLoadingSettings,
    settingsError,
    isLoadingSubcategories,
    subcategoriesError,
    isIncomeTypeEnabled,
    toggleIncomeType,
    getSubcategories,
  } = useIncomeTypes(sourceId);

  const isLoading = isLoadingTypes || isLoadingSettings || isLoadingSubcategories;
  const error = typesError || settingsError || subcategoriesError;

  // Add static types for Products and Services
  const staticTypes = [
    {
      id: 'products',
      name: 'Products',
      description: 'Enable or disable product management',
    },
    {
      id: 'services',
      name: 'Services',
      description: 'Enable or disable service management',
    },
  ];

  const allTypes = [...staticTypes, ...incomeTypes];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load income type settings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Income Types
          </h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable income types for this source
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          ))
        ) : (
          allTypes.map((incomeType) => {
            const isEnabled = isIncomeTypeEnabled(incomeType.id);
            const subcategories = getSubcategories(incomeType.id);

            return (
              <Card 
                key={incomeType.id} 
                className={cn(
                  "p-4 transition-colors",
                  isEnabled ? "border-primary/50" : "opacity-70"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{incomeType.name}</h3>
                      <Badge variant={isEnabled ? "default" : "secondary"}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {incomeType.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {incomeType.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enable-${incomeType.id}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        toggleIncomeType(incomeType.id, checked)
                      }
                    />
                    <Label htmlFor={`enable-${incomeType.id}`} className="sr-only">
                      {isEnabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>

                {subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map((sub) => (
                      <Badge key={sub.id} variant="secondary">
                        {sub.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};