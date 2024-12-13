import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Folder, PlusCircle, Menu, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Source {
  id: string;
  name: string;
}

export function AppSidebar() {
  const [sources, setSources] = useState<Source[]>([
    { id: "personal", name: "Personal" },
  ]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const addNewSource = () => {
    const name = prompt("Enter source name:");
    if (name) {
      if (sources.some((source) => source.name.toLowerCase() === name.toLowerCase())) {
        toast({
          title: "Error",
          description: "A source with this name already exists.",
          variant: "destructive",
        });
        return;
      }
      setSources([...sources, { id: Date.now().toString(), name }]);
      toast({
        title: "Success",
        description: "New source added successfully.",
      });
    }
  };

  const SidebarContentComponent = () => (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel>Sources</SidebarGroupLabel>
          <button
            onClick={addNewSource}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            {sources.map((source) => (
              <SidebarMenuItem key={source.id}>
                <SidebarMenuButton asChild>
                  <a 
                    href={`/source/${source.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Folder className="w-4 h-4" />
                    <span>{source.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex justify-end p-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContentComponent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar>
          <SidebarContentComponent />
        </Sidebar>
      </div>
    </>
  );
}