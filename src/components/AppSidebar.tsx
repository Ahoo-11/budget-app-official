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

type UserRole = 'controller' | 'admin' | 'viewer';

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

      const userRoleValue = userRole?.role as UserRole ?? null;
      console.log('Final user role:', userRoleValue);
      return userRoleValue;
    }
  });

  const { data: sources } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgetapp_sources')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName.trim() || !session?.user?.id || currentUserRole !== 'controller') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only controllers can add new sources.",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgetapp_sources')
        .insert({
          name: newSourceName.trim(),
          user_id: session.user.id
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Source added successfully.",
      });
      setNewSourceName("");
      setIsAddSourceOpen(false);
    } catch (error) {
      console.error('Error adding source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add source. Please try again.",
      });
    }
  };

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-4">
            <div className="space-y-1">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/transactions">
                <Button variant="ghost" className="w-full justify-start">
                  Transactions
                </Button>
              </Link>

              {(currentUserRole === 'controller' || currentUserRole === 'admin') && (
                <Link to="/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
              )}

              {/* Sources Section */}
              <div className="mt-6">
                <h3 className="mb-2 px-4 text-sm font-semibold text-gray-500">
                  Sources
                </h3>
                <div className="space-y-1">
                  {sources?.map((source) => (
                    <Link key={source.id} to={`/source/${source.id}`}>
                      <Button variant="ghost" className="w-full justify-start">
                        {source.name}
                      </Button>
                    </Link>
                  ))}
                  
                  {currentUserRole === 'controller' && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsAddSourceOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Source
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex h-screen w-[300px] flex-col gap-4 border-r px-4 py-8">
        <nav className="h-full py-4 flex flex-col bg-white border-r">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">
              Budget App
            </h2>
            
            <div className="space-y-1">
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/transactions">
                <Button variant="ghost" className="w-full justify-start">
                  Transactions
                </Button>
              </Link>

              {(currentUserRole === 'controller' || currentUserRole === 'admin') && (
                <Link to="/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
              )}

              {/* Sources Section */}
              <div className="mt-6">
                <h3 className="mb-2 px-4 text-sm font-semibold text-gray-500">
                  Sources
                </h3>
                <div className="space-y-1">
                  {sources?.map((source) => (
                    <Link key={source.id} to={`/source/${source.id}`}>
                      <Button variant="ghost" className="w-full justify-start">
                        {source.name}
                      </Button>
                    </Link>
                  ))}
                  
                  {currentUserRole === 'controller' && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsAddSourceOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Source
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto px-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </nav>
      </aside>

      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter source name"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={handleAddSource}
              disabled={!newSourceName.trim()}
            >
              Add Source
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}