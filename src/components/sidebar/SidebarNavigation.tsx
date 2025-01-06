import { Button } from "@/components/ui/button";
import { Plus, Settings2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { SourcesList } from "./SourcesList";
import { Source } from "@/types/source";

interface SidebarNavigationProps {
  sources: Source[];
  userStatus: string | null;
  onAddSource: () => void;
  onLogout: () => void;
  onCloseMobileMenu: () => void;
}

export function SidebarNavigation({
  sources,
  userStatus,
  onAddSource,
  onLogout,
  onCloseMobileMenu
}: SidebarNavigationProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Expense Tracker</h2>
      </div>
      <div className="flex-1">
        <SidebarNav />
        {userStatus === 'approved' && (
          <>
            <SourcesList 
              sources={sources} 
              onCloseMobileMenu={onCloseMobileMenu} 
            />
            <Button 
              variant="ghost" 
              className="w-full justify-start mt-2"
              onClick={() => {
                onAddSource();
                onCloseMobileMenu();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {userStatus === 'approved' && (
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <Button variant="outline" size="icon" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}