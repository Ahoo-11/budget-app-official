import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProductHeaderProps {
  name: string;
}

export const ProductHeader = ({ name }: ProductHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">{name}</h1>
    </div>
  );
};