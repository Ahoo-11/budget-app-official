import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, BarChart3, Settings2 } from "lucide-react";

export function SidebarNav() {
  return (
    <div className="space-y-1">
      <Link to="/">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </Link>
      <Link to="/reports">
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Reports
        </Button>
      </Link>
      <Link to="/stats">
        <Button variant="ghost" className="w-full justify-start">
          <BarChart3 className="mr-2 h-4 w-4" />
          Stats
        </Button>
      </Link>
      <Link to="/settings">
        <Button variant="ghost" className="w-full justify-start">
          <Settings2 className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </Link>
    </div>
  );
}