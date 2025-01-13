import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LockIcon, BanknoteIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  source_id: string;
  status: 'active' | 'closing' | 'closed';
  start_time: string;
  total_cash: number;
  total_transfer: number;
  total_sales: number;
  total_expenses: number;
}

export const SessionManager = ({ sourceId }: { sourceId: string }) => {
  const { toast } = useToast();

  const { data: activeSession, isLoading } = useQuery({
    queryKey: ['active-session', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Session | null;
    },
    enabled: !!sourceId
  });

  const handleCloseSession = async () => {
    if (!activeSession) return;
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'closed', end_time: new Date().toISOString() })
        .eq('id', activeSession.id);

      if (error) throw error;

      toast({
        title: "Session closed",
        description: "A new session has been started automatically.",
      });
    } catch (error) {
      console.error('Error closing session:', error);
      toast({
        title: "Error",
        description: "Failed to close session",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (!activeSession) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No active session found</p>
          <Button 
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('sessions')
                  .insert([{ source_id: sourceId }]);
                
                if (error) throw error;
                
                toast({
                  title: "Success",
                  description: "New session started",
                });
              } catch (error) {
                console.error('Error creating session:', error);
                toast({
                  title: "Error",
                  description: "Failed to create session",
                  variant: "destructive",
                });
              }
            }}
            className="mt-4"
          >
            Start New Session
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Active Session</h2>
          <p className="text-muted-foreground">
            Started: {format(new Date(activeSession.start_time), 'PPp')}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleCloseSession}
          className="flex items-center gap-2"
        >
          <LockIcon className="w-4 h-4" />
          Close Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-secondary">
          <div className="flex items-center gap-2">
            <BanknoteIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Cash</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_cash.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-secondary">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Transfer</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_transfer.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-secondary">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Total Sales</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_sales.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-secondary">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_expenses.toFixed(2)}
          </p>
        </Card>
      </div>
    </Card>
  );
};