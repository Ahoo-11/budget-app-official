import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LockIcon, BanknoteIcon, ArrowDownIcon, ArrowUpIcon, Loader2Icon } from "lucide-react";
import { format, isValid } from "date-fns";
import { useEffect } from "react";

interface SessionData {
  id: string;
  source_id: string;
  status: 'active' | 'closing' | 'closed';
  start_time: string;
}

interface Bill {
  id: string;
  total: number;
  payment_method: 'cash' | 'transfer';
  status: string;
}

export const SessionManager = ({ sourceId }: { sourceId: string }) => {
  const { toast } = useToast();

  // Query active session
  const { data: activeSession, isLoading: isLoadingSession, error: sessionError, refetch } = useQuery({
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
      return data as SessionData | null;
    },
    enabled: !!sourceId,
    refetchInterval: 30000,
    retry: 1,
  });

  // Query bills for active session with real-time updates
  const { data: sessionBills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['session-bills', activeSession?.id],
    queryFn: async () => {
      if (!activeSession?.id) return [];
      
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('session_id', activeSession.id)
        .neq('status', 'cancelled');

      if (error) throw error;
      console.log('Session bills:', data);
      return data as Bill[];
    },
    enabled: !!activeSession?.id,
  });

  // Set up real-time subscription for bills
  useEffect(() => {
    if (!activeSession?.id) return;

    console.log('Setting up real-time subscription for session bills');
    const channel = supabase
      .channel('session-bills')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Real-time bill update received:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, refetch]);

  // Calculate totals from bills
  const totals = sessionBills.reduce((acc, bill) => ({
    total_cash: acc.total_cash + (bill.payment_method === 'cash' ? bill.total : 0),
    total_transfer: acc.total_transfer + (bill.payment_method === 'transfer' ? bill.total : 0),
    total_sales: acc.total_sales + bill.total,
    total_expenses: acc.total_expenses
  }), {
    total_cash: 0,
    total_transfer: 0,
    total_sales: 0,
    total_expenses: 0
  });

  const handleStartSession = async () => {
    try {
      const newSession = {
        source_id: sourceId,
        status: 'active' as const,
        start_time: new Date().toISOString(),
      };

      const { data: createdSession, error: createError } = await supabase
        .from('sessions')
        .insert(newSession)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('Created new session:', createdSession);
      await refetch();
      
      toast({
        title: "Success",
        description: "New session started",
      });
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
    }
  };

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

  if (sessionError) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Error loading session: {sessionError.message}</p>
        </div>
      </Card>
    );
  }

  if (isLoadingSession || isLoadingBills) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'PPp') : 'Invalid date';
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Active Session</h2>
          <div className="space-y-1">
            <p className="text-muted-foreground">
              Started: {formatDate(activeSession.start_time)}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {activeSession.id}
            </p>
          </div>
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
            MVR {totals.total_cash.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Transfer</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {totals.total_transfer.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Total Sales</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {totals.total_sales.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            MVR {totals.total_expenses.toFixed(2)}
          </p>
        </Card>
      </div>
    </Card>
  );
};