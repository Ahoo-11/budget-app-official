import { Service } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ServiceBasicInfoProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

export const ServiceBasicInfo = ({
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
}: ServiceBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Service name"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Service category"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service"
          className="h-20"
        />
      </div>
    </div>
  );
};
