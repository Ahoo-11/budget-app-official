import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/roles";
import { Source } from "@/types/source";

interface CreateUserFormProps {
  sources: Source[];
  onSubmit: (data: { email: string; role: UserRole; sourceId: string }) => Promise<void>;
  isLoading: boolean;
}

export function CreateUserForm({ sources, onSubmit, isLoading }: CreateUserFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [selectedSource, setSelectedSource] = useState<string>("none");

  const handleSubmit = async () => {
    await onSubmit({
      email,
      role,
      sourceId: selectedSource,
    });
    setEmail("");
    setRole("viewer");
    setSelectedSource("none");
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
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
        disabled={isLoading || !selectedSource || selectedSource === "none"}
      >
        {isLoading ? "Creating..." : "Create User"}
      </Button>
    </div>
  );
}