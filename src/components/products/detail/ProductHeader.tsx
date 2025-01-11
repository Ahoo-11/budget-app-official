import { ArrowLeft, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProductHeaderProps {
  name: string;
  isEditing: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  editedName?: string;
  onNameChange?: (name: string) => void;
}

export const ProductHeader = ({ 
  name, 
  isEditing, 
  onEditClick, 
  onSaveClick, 
  onCancelClick,
  editedName,
  onNameChange 
}: ProductHeaderProps) => {
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

      {isEditing ? (
        <>
          <input
            type="text"
            value={editedName}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary px-2"
          />
          <div className="flex gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelClick}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSaveClick}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{name}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="gap-2 ml-auto"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </>
      )}
    </div>
  );
};