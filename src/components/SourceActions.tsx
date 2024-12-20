import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface SourceActionsProps {
  sourceId: string;
  sourceName: string;
}

export function SourceActions({ sourceId, sourceName }: SourceActionsProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newName, setNewName] = useState(sourceName);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleRename = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Source name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('sources')
      .update({ name: newName.trim() })
      .eq('id', sourceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rename source",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Source renamed successfully",
    });
    
    // Close all dialogs and reset state
    setIsRenameOpen(false);
    setIsDropdownOpen(false);
    await queryClient.invalidateQueries({ queryKey: ['sources'] });
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete source",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Source deleted successfully",
    });
    
    // Close all dialogs and reset state
    setIsDeleteOpen(false);
    setIsDropdownOpen(false);
    await queryClient.invalidateQueries({ queryKey: ['sources'] });
    navigate('/');
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Source</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                />
                <Button onClick={handleRename} className="w-full">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Source</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this source? This action cannot be undone and all associated transactions will be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}