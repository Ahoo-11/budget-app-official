import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type UserRole = 'admin' | 'viewer' | 'controller';

interface Source {
  id: string;
  name: string;
}

interface SidebarNavigationProps {
  userRole: UserRole | null;
  onLogout: () => void;
  onCloseMobileMenu: () => void;
}

export function AppSidebar() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();

  const { data: currentUserRole } = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'viewer';

      const { data: userRole, error: roleError } = await supabase
        .from('budgetapp_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return 'viewer';
      }

      return (userRole?.role as UserRole) ?? 'viewer';
    },
  });

  const { data: sources = [] } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgetapp_sources')
        .select('id, name');

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      return (data || []) as Source[];
    },
  });

  const handleAddSource = async () => {
    if (!newSourceName.trim()) {
      toast({
        title: "Error",
        description: "Source name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a source",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('budgetapp_sources')
      .insert({
        name: newSourceName,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding source:', error);
      toast({
        title: "Error",
        description: "Failed to add source",
        variant: "destructive",
      });
      return;
    }

    setNewSourceName("");
    setIsAddSourceOpen(false);
    toast({
      title: "Success",
      description: "Source added successfully",
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    navigate("/login");
  };

  const sidebarContent = (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
        <div className="space-y-1">
          <Link
            to="/"
            className="flex items-center rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          <div className="mt-4">
            <h3 className="mb-2 px-4 text-sm font-medium text-gray-500">Sources</h3>
            {sources.map((source) => (
              <Link
                key={source.id}
                to={`/source/${source.id}`}
                className="flex items-center rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {source.name}
              </Link>
            ))}
            
            <Button
              onClick={() => setIsAddSourceOpen(true)}
              className="w-full justify-start mt-2"
              variant="ghost"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </div>

          <div className="mt-4">
            <Link
              to="/settings"
              className="flex items-center rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[200px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-[200px] h-screen border-r">
        {sidebarContent}
      </div>

      {/* Add Source Dialog */}
      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
            <DialogDescription>
              Enter a name for your new source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Source Name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
            />
            <Button onClick={handleAddSource} className="w-full">
              Add Source
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SidebarNavigation({ userRole, onLogout, onCloseMobileMenu }: SidebarNavigationProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/" onClick={onCloseMobileMenu}>
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/sources" onClick={onCloseMobileMenu}>
                Sources
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/bills" onClick={onCloseMobileMenu}>
                Bills
              </Link>
            </Button>
            {userRole === 'admin' && (
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/users" onClick={onCloseMobileMenu}>
                  Users
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 p-4">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}