import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { type UserRole } from "../UserRolesTable";

interface SourcesInfoProps {
  userId: string;
  userRole?: UserRole;
  sourcesInfo: string;
}

export function SourcesInfo({ userId, userRole, sourcesInfo }: SourcesInfoProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[200px]">
            {sourcesInfo}
          </span>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="font-semibold">Source Access Details</h4>
          <p className="text-sm">{sourcesInfo}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}