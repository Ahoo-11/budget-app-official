import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ConsignmentHeaderProps {
  consignment: {
    name: string;
    description?: string | null;
  };
}

export const ConsignmentHeader = ({ consignment }: ConsignmentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{consignment.name}</h1>
        </div>
        {consignment.description && (
          <p className="text-sm text-muted-foreground">{consignment.description}</p>
        )}
      </div>
    </div>
  );
};