import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = 'super_admin' | 'admin' | 'viewer';

interface Source {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

interface ManageUserFormProps {
  sources: Source[];
  existingUsers: User[];
  onSubmit: (data: { userId: string; role: UserRole; sourceId: string }) => Promise<void>;
  isLoading: boolean;
}

export function ManageUserForm({ sources, existingUsers, onSubmit, isLoading }: ManageUserFormProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [selectedSource, setSelectedSource] = useState<string>("");

  const handleSubmit = async () => {
    await onSubmit({
      userId: selectedUserId,
      role,
      sourceId: selectedSource,
    });
    setSelectedUserId("");
    setRole("viewer");
    setSelectedSource("");
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Select 
          value={selectedUserId} 
          onValueChange={setSelectedUserId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {existingUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Select 
          value={selectedSource} 
          onValueChange={setSelectedSource}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source (required)" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isLoading || !selectedSource || !selectedUserId}
      >
        {isLoading ? "Updating..." : "Update User Access"}
      </Button>
    </div>
  );
}