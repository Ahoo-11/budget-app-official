import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomeTypeSelectorProps {
  sourceId: string;
  selectedType: string | null;
  onTypeSelect: (typeId: string) => void;
}

export const IncomeTypeSelector = ({
  sourceId,
  selectedType,
  onTypeSelect,
}: IncomeTypeSelectorProps) => {
  const {
    incomeTypes,
    isLoadingTypes,
    typesError,
    isIncomeTypeEnabled,
  } = useIncomeTypes(sourceId);

  // Only show enabled income types for this source
  const enabledTypes = incomeTypes.filter((type) => isIncomeTypeEnabled(type.id));

  if (isLoadingTypes) {
    return <div>Loading income types...</div>;
  }

  if (typesError) {
    return <div>Error loading income types</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {enabledTypes.map((type) => (
        <Button
          key={type.id}
          variant="outline"
          size="sm"
          className={cn(
            "transition-all",
            selectedType === type.id
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary/10"
          )}
          onClick={() => onTypeSelect(type.id)}
        >
          {type.name}
        </Button>
      ))}
    </div>
  );
};