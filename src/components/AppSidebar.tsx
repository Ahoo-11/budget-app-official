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
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
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
      return data?.role;
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
    if (!newSourceName.trim() || !session?.user?.id || userStatus !== 'controller') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a source name and make sure you're logged in and have controller access.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sources')
        .insert({ 
          name: newSourceName.trim(),
          user_id: session.user.id
        });

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
            <SidebarNavigation sources={sources} onAddSource={() => setIsAddSourceOpen(true)} />
          </nav>
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex h-screen w-[300px] flex-col gap-4 border-r px-4 py-8">
        <SidebarNavigation sources={sources} onAddSource={() => setIsAddSourceOpen(true)} />
      </aside>

      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
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