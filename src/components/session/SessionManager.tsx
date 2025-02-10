import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LockIcon, BanknoteIcon, ArrowDownIcon, ArrowUpIcon, Loader2Icon } from "lucide-react";
import { format, isValid } from "date-fns";
import { useEffect } from "react";
import { Database } from "@/types/supabase";

type BudgetAppBill = Database['public']['Tables']['budgetapp_bills']['Row'];

interface Bill extends BudgetAppBill {
  payment_method: 'cash' | 'transfer';
}

export const SessionManager = ({ sourceId }: { sourceId: string }) => {
  const { toast } = useToast();

  // Query active session with better error handling
  const { data: activeSession, isLoading: isLoadingSession, error: sessionError, refetch } = useQuery({
    queryKey: ['active-session', sourceId],
    queryFn: async () => {
      console.log('Fetching active session for source:', sourceId);
      try {
        if (!sourceId) {
          return null;
        }
        
        const { data, error } = await supabase
          .from('budgetapp_sessions')
          .select('*')
          .eq('source_id', sourceId)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;

        console.log('Active session data:', data);
        return data;
      } catch (error) {
        console.error('Session fetch error:', error);
        throw error;
      }
    },
    enabled: Boolean(sourceId),
    refetchInterval: 30000,
    retry: 1,
  });

  // Query bills for active session with better error handling
  const { data: sessionBills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['session-bills', activeSession?.id],
    queryFn: async () => {
      if (!activeSession?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('budgetapp_bills')
          .select('*')
          .eq('session_id', activeSession.id)
          .neq('status', 'cancelled');

        if (error) {
          console.error('Error fetching bills:', error);
          throw error;
        }

        console.log('Session bills:', data);
        return (data as unknown as Bill[]) || [];
      } catch (error) {
        console.error('Bills fetch error:', error);
        throw error;
      }
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
          table: 'budgetapp_bills',
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
    total_cash: acc.total_cash + (bill.payment_method === 'cash' ? bill.total || 0 : 0),
    total_transfer: acc.total_transfer + (bill.payment_method === 'transfer' ? bill.total || 0 : 0),
    total_sales: acc.total_sales + (bill.total || 0),
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
        .from('budgetapp_sessions')
        .insert(newSession)
        .select()
        .single();

      if (createError) {
        console.error('Error creating session:', createError);
        throw createError;
      }

      console.log('Created new session:', createdSession);
      await refetch();
      
      toast({
        title: "Success",
        description: "New session started",
      });
    } catch (error: unknown) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    
    try {
      console.log('Closing session:', activeSession.id);
      const { error } = await supabase
        .from('budgetapp_sessions')
        .update({ 
          status: 'closed', 
          end_time: new Date().toISOString() 
        })
        .eq('id', activeSession.id);

      if (error) {
        console.error('Error closing session:', error);
        throw error;
      }

      await refetch();

      toast({
        title: "Session closed",
        description: "The session has been closed successfully.",
      });
    } catch (error: unknown) {
      console.error('Error closing session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to close session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'PPp') : 'Invalid date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
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

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold">Active Session</h2>
          <p className="text-muted-foreground">
            Started: {formatDate(activeSession.start_time)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BanknoteIcon className="h-5 w-5 text-green-500" />
                <span>Cash</span>
              </div>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">${totals.total_cash.toFixed(2)}</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BanknoteIcon className="h-5 w-5 text-blue-500" />
                <span>Transfer</span>
              </div>
              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">${totals.total_transfer.toFixed(2)}</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BanknoteIcon className="h-5 w-5 text-purple-500" />
                <span>Total Sales</span>
              </div>
              <ArrowUpIcon className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">${totals.total_sales.toFixed(2)}</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BanknoteIcon className="h-5 w-5 text-red-500" />
                <span>Expenses</span>
              </div>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">${totals.total_expenses.toFixed(2)}</p>
          </div>
        </div>

        <Button 
          onClick={handleCloseSession}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          Close Session
        </Button>
      </div>
    </Card>
  );
};