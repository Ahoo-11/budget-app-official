import { Button } from "@/components/ui/button";
import { Home, LogOut, Plus, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
            <Button variant="ghost" className="w-full justify-start">
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
    </div>
  );
}