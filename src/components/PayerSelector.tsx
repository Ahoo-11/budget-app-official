import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/types/database-types";

type Source = Database["budget_app"]["Tables"]["sources"]["Row"];

interface PayerSelectorProps {
  selectedPayer: string;
  setSelectedPayer: (payer: string) => void;
}

export const PayerSelector = ({ selectedPayer, setSelectedPayer }: PayerSelectorProps) => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's role first
  const { data: userRole } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }
      return data?.role;
    },
    enabled: !!session?.user?.id
  });

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('id, name, user_id, created_at')
        .order('name');
      
      if (error) {
        console.error('Error fetching sources:', error);
        throw error;
      }
      return (data || []) as Source[];
    },
    enabled: !!session?.user?.id
  });

  const addSource = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error("Must be logged in to add a source");
      if (userRole !== 'controller') throw new Error("Must be a controller to add sources");

      const { data, error } = await supabase
        .from('sources')
        .insert({
          name,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      setNewPayerName("");
      setIsDialogOpen(false);
      setSelectedPayer(data.id);
      setSearchQuery(data.name);
      toast({
        title: "Success",
        description: "Source added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredSources = sources.filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSourceName = sources.find(s => s.id === selectedPayer)?.name || '';

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayerName.trim()) {
      addSource.mutate(newPayerName.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium mb-2">Source</label>
        <div className="flex gap-2">
          <Input
            disabled
            type="text"
            placeholder="Loading sources..."
            className="flex-1 bg-gray-100"
          />
          <Button disabled variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Source</label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={userRole !== 'controller'}
              title={userRole !== 'controller' ? "Only controllers can add sources" : "Add new source"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSource} className="space-y-4">
              <Input
                placeholder="Source name"
                value={newPayerName}
                onChange={(e) => setNewPayerName(e.target.value)}
                required
              />
              <Button type="submit" disabled={!newPayerName.trim()}>
                Add Source
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {filteredSources.length > 0 ? (
        <ul className="mt-2 border rounded-lg divide-y">
          {filteredSources.map((source) => (
            <li key={source.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedPayer(source.id);
                  setSearchQuery(source.name);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                  selectedPayer === source.id ? 'bg-gray-50' : ''
                }`}
              >
                {source.name}
              </button>
            </li>
          ))}
        </ul>
      ) : searchQuery ? (
        <p className="text-sm text-gray-500">No sources found</p>
      ) : null}
      
      {selectedPayer && selectedSourceName && (
        <p className="text-sm text-gray-600">
          Selected: {selectedSourceName}
        </p>
      )}
    </div>
  );
};