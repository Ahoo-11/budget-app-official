import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Source } from "@/types/source";
import { SourceActions } from "../SourceActions";

interface SourcesListProps {
  sources: Source[];
  onCloseMobileMenu?: () => void;
}

export function SourcesList({ sources, onCloseMobileMenu }: SourcesListProps) {
  const location = useLocation();

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <div key={source.id} className="flex items-center">
          <Link 
            to={`/source/${source.id}`}
            onClick={onCloseMobileMenu}
            className="flex-1"
          >
            <Button 
              variant="ghost"
              className={cn(
                "w-full justify-start",
                location.pathname === `/source/${source.id}` && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              {source.name}
            </Button>
          </Link>
          <SourceActions sourceId={source.id} sourceName={source.name} />
        </div>
      ))}
    </div>
  );
}