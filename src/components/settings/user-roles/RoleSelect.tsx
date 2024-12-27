import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/roles";

interface RoleSelectProps {
  value?: UserRole;
  disabled?: boolean;
  onChange: (value: UserRole) => void;
}

export function RoleSelect({ value, disabled, onChange }: RoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="controller">Controller</SelectItem>
      </SelectContent>
    </Select>
  );
}