import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, CreditCard } from "lucide-react";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 h-full border-r bg-background z-40 w-[200px]",
        isCollapsed && "w-[70px]"
      )}
    >
      <div className="flex flex-col gap-4 p-4">
        <Link to="/">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <Home className="h-4 w-4 mr-2" />
            {!isCollapsed && "Home"}
          </Button>
        </Link>
        <Link to="/personal">
          <Button
            variant={isActive("/personal") ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {!isCollapsed && "Personal"}
          </Button>
        </Link>
        <Link to="/settings">
          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            {!isCollapsed && "Settings"}
          </Button>
        </Link>
      </div>
    </nav>
  );
}