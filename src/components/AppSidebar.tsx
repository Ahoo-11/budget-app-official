import { Button } from "@/components/ui/button";
import { Home, LogOut, Menu, Plus, User, Settings2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Source } from "@/types/source";
import { useQuery } from "@tanstack/react-query";
import { AccountSettings } from "./AccountSettings";
import { SourceActions } from "./SourceActions";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: sources = [] } = useQuery({
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
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a source name",
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
      .from('sources')
      .insert([
        { name: newSourceName.trim(), user_id: user.id }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add source. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Source added successfully",
    });

    setNewSourceName("");
    setIsAddSourceOpen(false);
    navigate(`/source/${data.id}`);
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
          <Link to="/personal" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Personal
            </Button>
          </Link>
          {sources
            .filter(source => source.name.toLowerCase() !== 'personal')
            .map((source) => (
              <div key={source.id} className="flex items-center">
                <Link 
                  to={`/source/${source.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
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
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
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

      {/* Desktop Sidebar */}
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