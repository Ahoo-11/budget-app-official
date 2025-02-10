import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueryClient } from "@tanstack/react-query";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { BillDBRow, BillProduct } from "@/types/bills";
import { Session } from '@supabase/supabase-js';

export function useBillRealtime(
  sourceId: string | null,
  queryClient: QueryClient,
  activeBillId: string | null,
  setSelectedProducts: (products: BillProduct[]) => void,
  session: Session | null
) {
  const { toast } = useToast();

  const handleRealtimeUpdate = useCallback(async (payload: RealtimePostgresChangesPayload<BillDBRow>) => {
    console.log('🔄 Real-time bill update:', payload);
    
    // Force refetch bills on any change
    queryClient.invalidateQueries({ queryKey: ['bills', sourceId] });
    
    // If the active bill was deleted, clear selected products
    if (payload.eventType === 'DELETE' && payload.old?.id === activeBillId) {
      setSelectedProducts([]);
    }

    // Show toast notification for bill updates
    if (payload.eventType === 'INSERT') {
      toast({
        title: "New bill created",
        description: "A new bill has been created successfully.",
      });
    } else if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
      toast({
        title: "Bill completed",
        description: "The bill has been marked as completed.",
      });
    }
  }, [activeBillId, queryClient, setSelectedProducts, sourceId, toast]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const setupRealtimeSubscription = async () => {
      const channel = supabase
        .channel('bills-channel')
        .on<BillDBRow>(
          'postgres_changes',
          { 
            event: '*',
            schema: 'public',
            table: 'budgetapp_bills',
            filter: sourceId && sourceId !== 'all' 
              ? `source_id=eq.${sourceId} and created_by=eq.${session.user.id}`
              : `created_by=eq.${session.user.id}`
          },
          handleRealtimeUpdate
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to bills channel');
          }
          if (status === 'CHANNEL_ERROR') {
            console.log('❌ Failed to subscribe to bills channel');
            // Try to reconnect after a delay
            setTimeout(setupRealtimeSubscription, 5000);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [sourceId, handleRealtimeUpdate, session?.user?.id]);
}