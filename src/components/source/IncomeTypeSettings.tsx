import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
          <h2 className="text-2xl font-bold">Income Types</h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable income types for this source
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          // Loading skeletons
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
          incomeTypes.map((incomeType) => {
            const isEnabled = isIncomeTypeEnabled(incomeType.id);
            const subcategories = getSubcategories(incomeType.id);

            return (
              <Card key={incomeType.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{incomeType.name}</h3>
                    {incomeType.description && (
                      <p className="text-sm text-muted-foreground">
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
                    <Label htmlFor={`enable-${incomeType.id}`}>
                      {isEnabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <Badge key={sub.id} variant="secondary">
                      {sub.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
