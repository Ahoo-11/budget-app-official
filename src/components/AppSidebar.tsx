import { Button } from "@/components/ui/button";
import { Home, Menu, Plus, Settings2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

export function AppSidebar() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();

  const { data: sources = [], refetch } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at');
      
      if (error) {
        console.error('Error fetching sources:', error);
        throw error;
      }
      return data as Source[];
    }
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
      navigate('/auth');
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName.trim() || !session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a source name and make sure you're logged in.",
      });
      return;
    }

    const { error } = await supabase
      .from('sources')
      .insert([{ 
        name: newSourceName.trim(),
        user_id: session.user.id
      }]);

    if (error) {
      console.error('Error adding source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add source. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Source added successfully.",
    });
    setNewSourceName("");
    setIsAddSourceOpen(false);
    refetch();
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Expense Tracker</h2>
      </div>
      <div className="flex-1">
        <nav className="space-y-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          {sources.map((source) => (
            <div key={source.id} className="flex items-center">
              <Link 
                to={`/source/${source.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1"
              >
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  {source.name}
                </Button>
              </Link>
              <SourceActions sourceId={source.id} sourceName={source.name} />
            </div>
          ))}
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => {
              setIsAddSourceOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        <Link to="/settings">
          <Button variant="outline" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </Link>
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