import { useTypes } from "@/hooks/useTypes";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypeSettingsProps {
  sourceId: string;
}

export const TypeSettings = ({ sourceId }: TypeSettingsProps) => {
  const {
    types,
    isLoadingTypes,
    typesError,
    isLoadingSettings,
    settingsError,
    isLoadingSubcategories,
    subcategoriesError,
    isTypeEnabled,
    toggleType,
    getSubcategories,
  } = useTypes(sourceId);

  const isLoading = isLoadingTypes || isLoadingSettings || isLoadingSubcategories;
  const error = typesError || settingsError || subcategoriesError;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load type settings. Please try again later.
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
            Types Visibility
          </h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable types for this source. Disabled types will be hidden from menus and filters.
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
          types.map((type) => {
            const isEnabled = isTypeEnabled(type.id);
            const subcategories = getSubcategories(type.id);

            return (
              <Card 
                key={type.id} 
                className={cn(
                  "p-4 transition-colors",
                  isEnabled ? "border-primary/50" : "opacity-70"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      <Badge variant={isEnabled ? "default" : "secondary"}>
                        {isEnabled ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                    {type.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enable-${type.id}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        toggleType(type.id, checked)
                      }
                    />
                    <Label htmlFor={`enable-${type.id}`} className="sr-only">
                      {isEnabled ? "Visible" : "Hidden"}
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