import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database.types";

type UserRole = 'controller' | 'admin' | 'viewer';
type Tables = Database['public']['Tables'];

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

  const { data: currentUserRole } = useQuery<UserRole | null>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('Current user:', user.email);

      const { data: userRole, error: roleError } = await supabase
        .from('budgetapp_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      console.log('Role data:', userRole);
      console.log('Role error:', roleError);

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      return userRole?.role as UserRole ?? null;
    },
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: sources, error } = await supabase
        .from('budgetapp_sources')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      return sources;
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

    const { error } = await supabase
      .from('budgetapp_sources')
      .insert({
        name: newSourceName,
        user_id: user.id,
      });

    if (error) {
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

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SidebarNavigation
            userRole={currentUserRole}
            onLogout={handleLogout}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <nav className="hidden lg:block">
        <SidebarNavigation
          userRole={currentUserRole}
          onLogout={handleLogout}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </nav>

      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Source name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
            />
            <Button onClick={handleAddSource}>Add Source</Button>
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