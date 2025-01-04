import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const location = useLocation();
  
  return (
    <nav className="space-y-2">
      <Link to="/" >
        <Button 
          variant="ghost"
          className={cn(
            "w-full justify-start",
            location.pathname === "/" && "bg-accent text-accent-foreground font-medium"
          )}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </Link>
    </nav>
  );
}