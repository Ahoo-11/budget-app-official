import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { useSources } from "@/hooks/useSources";

export function AppSidebar() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();

  const { data: userStatus } = useQuery({
    queryKey: ['userStatus', session?.user?.id],
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
    enabled: !!session?.user?.id
  });

  const { data: sources = [] } = useSources(userStatus);

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
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-4">
            <SidebarNavigation
              sources={sources}
              userStatus={userStatus}
              onAddSource={() => setIsAddSourceOpen(true)}
              onLogout={handleLogout}
              onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="border-r bg-background fixed top-0 left-0 h-screen w-[200px] p-4 hidden md:block overflow-hidden">
        <SidebarNavigation
          sources={sources}
          userStatus={userStatus}
          onAddSource={() => setIsAddSourceOpen(true)}
          onLogout={handleLogout}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
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