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
import { Home, Folder, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Source {
  id: string;
  name: string;
}

export function AppSidebar() {
  const [sources, setSources] = useState<Source[]>([
    { id: "personal", name: "Personal" },
  ]);
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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
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
                    <a href={`/source/${source.id}`}>
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
    </Sidebar>
  );
}