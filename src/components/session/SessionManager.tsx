import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LockIcon, BanknoteIcon, ArrowDownIcon, ArrowUpIcon, Loader2Icon } from "lucide-react";
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

  const { data: activeSession, isLoading, error, refetch } = useQuery({
    queryKey: ['active-session', sourceId],
    queryFn: async () => {
      console.log('Fetching active session for source:', sourceId);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching session:', error);
        throw error;
      }

      console.log('Active session data:', data);
      return data as Session | null;
    },
    enabled: !!sourceId,
    refetchInterval: 30000,
    retry: 1,
  });

  const handleCloseSession = async () => {
    if (!activeSession) return;
    
    try {
      console.log('Closing session:', activeSession.id);
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status: 'closed', 
          end_time: new Date().toISOString() 
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      await refetch();

      toast({
        title: "Session closed",
        description: "The session has been closed successfully.",
      });
    } catch (error: any) {
      console.error('Error closing session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to close session",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = async () => {
    try {
      // First, try to fetch any existing active session
      const { data: existingSession, error: checkError } = await supabase
        .from('sessions')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing session:', checkError);
        throw checkError;
      }

      if (existingSession) {
        console.log('Found existing active session:', existingSession);
        await refetch();
        return;
      }

      // If no active session exists, create a new one
      const { error: createError } = await supabase
        .from('sessions')
        .insert({
          source_id: sourceId,
          status: 'active',
          start_time: new Date().toISOString(),
          total_cash: 0,
          total_transfer: 0,
          total_sales: 0,
          total_expenses: 0
        });

      if (createError) {
        if (createError.code === '23505') {
          // If we hit the unique constraint, it means a session was created
          // between our check and insert. Just refetch to get the latest state.
          await refetch();
          return;
        }
        throw createError;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: "New session started",
      });
    } catch (error: any) {
      console.error('Error managing session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage session",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Error loading session: {error.message}</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2Icon className="h-5 w-5 animate-spin" />
          <p>Loading session...</p>
        </div>
      </Card>
    );
  }

  if (!activeSession) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <LockIcon className="h-8 w-8 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Active Session</h2>
            <p className="text-muted-foreground">Start a new session to begin recording transactions</p>
          </div>
          <Button 
            onClick={handleStartSession}
            className="w-full sm:w-auto"
            size="lg"
          >
            Start New Session
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Active Session</h2>
          <p className="text-muted-foreground">
            Started: {format(new Date(activeSession.start_time), 'PPp')}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleCloseSession}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <LockIcon className="w-4 h-4" />
          Close Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <BanknoteIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Cash</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_cash.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Transfer</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_transfer.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Total Sales</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {activeSession.total_sales.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
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