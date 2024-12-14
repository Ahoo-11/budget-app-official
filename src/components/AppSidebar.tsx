import { Button } from "@/components/ui/button";
import { Home, LogOut, Plus, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");

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

  return (
    <div className="border-r bg-background h-screen w-[200px] p-4">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h2 className="font-semibold mb-4">Expense Tracker</h2>
          <nav className="space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/personal">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Personal
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setIsAddSourceOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </nav>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent>
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
    </div>
  );
}