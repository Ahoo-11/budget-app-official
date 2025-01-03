import { Button } from "@/components/ui/button";
import { Home, Menu, Plus, Settings2, LogOut, BarChart } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Source } from "@/types/source";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SourceActions } from "./SourceActions";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const session = useSession();

  const { data: userStatus } = useQuery({
    queryKey: ['userStatus'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user status. Please try refreshing the page.",
        });
        throw error;
      }
      return data?.status;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: 1000
  });

  const { data: sources = [], refetch } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      if (!session?.user?.id || userStatus !== 'approved') return [];
      
      try {
        // First check user's role
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          throw roleError;
        }

        let query = supabase.from('sources').select('*');

        // If not a controller/super_admin, only fetch permitted sources
        if (!userRole || !['controller', 'super_admin'].includes(userRole.role)) {
          const { data: permissions, error: permError } = await supabase
            .from('source_permissions')
            .select('source_id')
            .eq('user_id', session.user.id);

          if (permError) {
            console.error('Error fetching permissions:', permError);
            throw permError;
          }

          if (permissions && permissions.length > 0) {
            const sourceIds = permissions.map(p => p.source_id);
            query = query.in('id', sourceIds);
          } else {
            return [];
          }
        }

        const { data, error } = await query.order('created_at');
        
        if (error) {
          console.error('Error fetching sources:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch sources. Please try refreshing the page.",
          });
          throw error;
        }
        return data as Source[];
      } catch (error) {
        console.error('Error in sources query:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching sources. Please try again.",
        });
        throw error;
      }
    },
    enabled: !!session?.user?.id && userStatus === 'approved',
    retry: 3,
    retryDelay: 1000
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName.trim() || !session?.user?.id || userStatus !== 'approved') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a source name and make sure you're logged in and approved.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sources')
        .insert([{ 
          name: newSourceName.trim(),
          user_id: session.user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Source added successfully.",
      });
      setNewSourceName("");
      setIsAddSourceOpen(false);
      refetch();
    } catch (error) {
      console.error('Error adding source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add source. Please try again.",
      });
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Expense Tracker</h2>
      </div>
      <div className="flex-1">
        <nav className="space-y-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
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
          {userStatus === 'approved' && (
            <>
              {sources.map((source) => (
                <div key={source.id} className="flex items-center">
                  <Link 
                    to={`/source/${source.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
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
              <Link to="/stats" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location.pathname === "/stats" && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Stats
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  location.pathname === "/add-source" && "bg-accent text-accent-foreground font-medium"
                )}
                onClick={() => {
                  setIsAddSourceOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        {userStatus === 'approved' && (
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-4">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="border-r bg-background fixed top-0 left-0 h-screen w-[200px] p-4 hidden md:block overflow-hidden">
        <NavContent />
      </div>

      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter source name"
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